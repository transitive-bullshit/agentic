import type Stripe from 'stripe'
import { assert } from '@agentic/platform-core'
import {
  getLabelForPricingInterval,
  type PricingPlan,
  type PricingPlanLineItem
} from '@agentic/platform-types'
import pAll from 'p-all'

import {
  db,
  eq,
  getPricingPlanLineItemHashForStripePrice,
  type RawDeployment,
  type RawProject,
  schema
} from '@/db'
import { stripe } from '@/lib/external/stripe'

/**
 * Upserts all the Stripe resources corresponding to a Deployment's pricing
 * plans.
 *
 * This includes Stripe `Product`, `Meter`, and `Price` objects.
 *
 * All Stripe resource IDs are stored in the `_stripeProductIdMap`,
 * `_stripeMeterIdMap`, and `_stripePriceIdMap` fields of the given `project`.
 *
 * The `project` will be updated in the DB with any changes.
 *
 * The `deployment` is readonly and will not be updated, since all Stripe
 * resources persist on its Project so they can be reused if possible across
 * deployments.
 *
 * @note This function assumes that the deployment's pricing config has already
 * been validated.
 */
export async function upsertStripePricingResources({
  deployment,
  project
}: {
  deployment: Readonly<RawDeployment>
  project: RawProject
}): Promise<void> {
  assert(
    deployment.projectId === project.id,
    'Deployment and project must match'
  )

  // Keep track of promises for Stripe resources that are created in parallel
  // to avoid race conditions.
  const stripeProductIdPromiseMap = new Map<string, Promise<string>>()
  const stripeMeterIdPromiseMap = new Map<string, Promise<string>>()
  const stripePriceIdPromiseMap = new Map<string, Promise<string>>()

  const stripeConnectParams = project._stripeAccountId
    ? [
        {
          stripeAccount: project._stripeAccountId
        }
      ]
    : []
  let dirty = false

  async function upsertStripeResourcesForPricingPlanLineItem({
    pricingPlan,
    pricingPlanLineItem
  }: {
    pricingPlan: PricingPlan
    pricingPlanLineItem: PricingPlanLineItem
  }) {
    const { slug: pricingPlanSlug } = pricingPlan
    const { slug: pricingPlanLineItemSlug } = pricingPlanLineItem

    // Upsert the Stripe Product
    if (!project._stripeProductIdMap[pricingPlanLineItemSlug]) {
      if (stripeProductIdPromiseMap.has(pricingPlanLineItemSlug)) {
        const stripeProductId = await stripeProductIdPromiseMap.get(
          pricingPlanLineItemSlug
        )!

        project._stripeProductIdMap[pricingPlanLineItemSlug] = stripeProductId
        dirty = true
      } else {
        const productParams: Stripe.ProductCreateParams = {
          name: `${project.identifier} ${pricingPlanLineItemSlug}`,
          type: 'service',
          metadata: {
            projectId: project.id,
            pricingPlanLineItemSlug
          }
        }

        if (pricingPlanLineItem.usageType === 'licensed') {
          productParams.unit_label = pricingPlanLineItem.label
        } else {
          productParams.unit_label = pricingPlanLineItem.unitLabel
        }

        const productP = stripe.products.create(
          productParams,
          ...stripeConnectParams
        )
        stripeProductIdPromiseMap.set(
          pricingPlanLineItemSlug,
          productP.then((p) => p.id)
        )

        const product = await productP

        project._stripeProductIdMap[pricingPlanLineItemSlug] = product.id
        dirty = true
      }
    }

    assert(project._stripeProductIdMap[pricingPlanLineItemSlug])

    if (pricingPlanLineItem.usageType === 'metered') {
      // Upsert the Stripe Meter
      if (!project._stripeMeterIdMap[pricingPlanLineItemSlug]) {
        if (stripeMeterIdPromiseMap.has(pricingPlanLineItemSlug)) {
          const stripeMeterId = await stripeMeterIdPromiseMap.get(
            pricingPlanLineItemSlug
          )!

          project._stripeMeterIdMap[pricingPlanLineItemSlug] = stripeMeterId
          dirty = true
        } else {
          const meterP = stripe.billing.meters.create(
            {
              display_name: `${project.identifier} ${pricingPlanLineItem.label || pricingPlanLineItemSlug}`,
              event_name: `meter-${project.id}-${pricingPlanLineItemSlug}`,
              // TODO: This currently isn't taken into account for the slug, so if it
              // changes across deployments, the meter will not be updated.
              default_aggregation: {
                formula:
                  pricingPlanLineItem.defaultAggregation?.formula ?? 'sum'
              },
              customer_mapping: {
                event_payload_key: 'stripe_customer_id',
                type: 'by_id'
              },
              value_settings: {
                event_payload_key: 'value'
              }
            },
            ...stripeConnectParams
          )

          stripeMeterIdPromiseMap.set(
            pricingPlanLineItemSlug,
            meterP.then((m) => m.id)
          )

          const stripeMeter = await meterP

          project._stripeMeterIdMap[pricingPlanLineItemSlug] = stripeMeter.id
          dirty = true
        }
      }

      assert(project._stripeMeterIdMap[pricingPlanLineItemSlug])
    } else {
      assert(pricingPlanLineItem.usageType === 'licensed', 400)

      assert(
        !project._stripeMeterIdMap[pricingPlanLineItemSlug],
        400,
        `Invalid pricing plan metric "${pricingPlanLineItemSlug}" for pricing plan "${pricingPlanSlug}": licensed pricing plan metrics cannot replace a previous metered pricing plan metric. Use a different pricing plan metric slug for the new licensed plan.`
      )
    }

    const pricingPlanLineItemHashForStripePrice =
      await getPricingPlanLineItemHashForStripePrice({
        pricingPlan,
        pricingPlanLineItem,
        project
      })

    // Upsert the Stripe Price
    if (!project._stripePriceIdMap[pricingPlanLineItemHashForStripePrice]) {
      if (stripePriceIdPromiseMap.has(pricingPlanLineItemHashForStripePrice)) {
        const stripePriceId = await stripePriceIdPromiseMap.get(
          pricingPlanLineItemHashForStripePrice
        )!

        project._stripePriceIdMap[pricingPlanLineItemHashForStripePrice] =
          stripePriceId
        dirty = true
      } else {
        const interval = pricingPlan.interval ?? project.defaultPricingInterval

        // (nickname is hidden from customers)
        const nickname = [
          'price',
          project.id,
          pricingPlanLineItemSlug,
          getLabelForPricingInterval(interval)
        ]
          .filter(Boolean)
          .join('-')

        const priceParams: Stripe.PriceCreateParams = {
          product: project._stripeProductIdMap[pricingPlanLineItemSlug],
          currency: project.pricingCurrency,
          nickname,
          recurring: {
            interval,

            // TODO: support this
            interval_count: 1,

            usage_type: pricingPlanLineItem.usageType,

            meter: project._stripeMeterIdMap[pricingPlanLineItemSlug]
          },
          metadata: {
            projectId: project.id,
            pricingPlanLineItemSlug
          }
        }

        if (pricingPlanLineItem.usageType === 'licensed') {
          priceParams.unit_amount_decimal =
            pricingPlanLineItem.amount.toFixed(12)
        } else {
          priceParams.billing_scheme = pricingPlanLineItem.billingScheme

          if (pricingPlanLineItem.billingScheme === 'tiered') {
            assert(
              pricingPlanLineItem.tiers?.length,
              400,
              `Invalid pricing plan metric "${pricingPlanLineItemSlug}" for pricing plan "${pricingPlanSlug}": tiered billing schemes must have at least one tier.`
            )

            priceParams.tiers_mode = pricingPlanLineItem.tiersMode
            priceParams.tiers = pricingPlanLineItem.tiers.map((tierData) => {
              const tier: Stripe.PriceCreateParams.Tier = {
                up_to: tierData.upTo
              }

              if (tierData.unitAmount !== undefined) {
                tier.unit_amount_decimal = tierData.unitAmount.toFixed(12)
              }

              if (tierData.flatAmount !== undefined) {
                tier.flat_amount_decimal = tierData.flatAmount.toFixed(12)
              }

              return tier
            })
          } else {
            assert(
              pricingPlanLineItem.billingScheme === 'per_unit',
              400,
              `Invalid pricing plan metric "${pricingPlanLineItemSlug}" for pricing plan "${pricingPlanSlug}": invalid billing scheme.`
            )
            assert(
              pricingPlanLineItem.unitAmount !== undefined,
              400,
              `Invalid pricing plan metric "${pricingPlanLineItemSlug}" for pricing plan "${pricingPlanSlug}": unitAmount is required for per_unit billing schemes.`
            )

            priceParams.unit_amount_decimal =
              pricingPlanLineItem.unitAmount.toFixed(12)

            if (pricingPlanLineItem.transformQuantity) {
              priceParams.transform_quantity = {
                divide_by: pricingPlanLineItem.transformQuantity.divideBy,
                round: pricingPlanLineItem.transformQuantity.round
              }
            }
          }
        }

        const stripePriceP = stripe.prices.create(
          priceParams,
          ...stripeConnectParams
        )

        stripePriceIdPromiseMap.set(
          pricingPlanLineItemHashForStripePrice,
          stripePriceP.then((p) => p.id)
        )

        const stripePrice = await stripePriceP

        project._stripePriceIdMap[pricingPlanLineItemHashForStripePrice] =
          stripePrice.id
        dirty = true
      }
    }

    assert(project._stripePriceIdMap[pricingPlanLineItemHashForStripePrice])
  }

  const upserts: Array<() => Promise<void>> = []
  for (const pricingPlan of deployment.pricingPlans) {
    for (const pricingPlanLineItem of pricingPlan.lineItems) {
      upserts.push(() =>
        upsertStripeResourcesForPricingPlanLineItem({
          pricingPlan,
          pricingPlanLineItem
        })
      )
    }
  }

  await pAll(upserts, { concurrency: 8 })

  if (dirty) {
    await db
      .update(schema.projects)
      .set(project)
      .where(eq(schema.projects.id, project.id))
  }
}
