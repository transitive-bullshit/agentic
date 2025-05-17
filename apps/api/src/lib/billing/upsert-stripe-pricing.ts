import type Stripe from 'stripe'
import pAll from 'p-all'

import { db, eq, type RawDeployment, type RawProject, schema } from '@/db'
import {
  getLabelForPricingInterval,
  getPricingPlanLineItemHashForStripePrice,
  getPricingPlansByInterval,
  type PricingPlan,
  type PricingPlanLineItem
} from '@/db/schema'
import { stripe } from '@/lib/stripe'
import { assert } from '@/lib/utils'

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
 * The `deployment` is readonly and will not be updated, since all Stripe
 * resources persist on its Project in case they're the same across deployments.
 */
export async function upsertStripePricing({
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
      const productParams: Stripe.ProductCreateParams = {
        name: `${project.id} ${pricingPlanLineItemSlug}`,
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

      const product = await stripe.products.create(
        productParams,
        ...stripeConnectParams
      )

      project._stripeProductIdMap[pricingPlanLineItemSlug] = product.id
      dirty = true
    }

    assert(project._stripeProductIdMap[pricingPlanLineItemSlug])

    if (pricingPlanLineItem.usageType === 'metered') {
      // Upsert the Stripe Meter
      if (!project._stripeMeterIdMap[pricingPlanLineItemSlug]) {
        const stripeMeter = await stripe.billing.meters.create(
          {
            display_name: `${project.id} ${pricingPlanLineItem.label || pricingPlanLineItemSlug}`,
            event_name: `meter-${project.id}-${pricingPlanLineItemSlug}`,
            // TODO: This currently isn't taken into account for the slug, so if it
            // changes across deployments, the meter will not be updated.
            default_aggregation: {
              formula: pricingPlanLineItem.defaultAggregation?.formula ?? 'sum'
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

        project._stripeMeterIdMap[pricingPlanLineItemSlug] = stripeMeter.id
        dirty = true
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
      getPricingPlanLineItemHashForStripePrice({
        pricingPlan,
        pricingPlanLineItem,
        project
      })

    // Upsert the Stripe Price
    if (!project._stripePriceIdMap[pricingPlanLineItemHashForStripePrice]) {
      const interval =
        pricingPlanLineItem.interval ?? project.defaultPricingInterval

      const nickname = [
        'price',
        project.id,
        pricingPlanLineItemSlug,
        getLabelForPricingInterval(interval)
      ]
        .filter(Boolean)
        .join('-')

      const priceParams: Stripe.PriceCreateParams = {
        nickname,
        product: project._stripeProductIdMap[pricingPlanLineItemSlug],
        currency: project.pricingCurrency,
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
        priceParams.unit_amount_decimal = pricingPlanLineItem.amount.toFixed(12)
      } else {
        priceParams.billing_scheme = pricingPlanLineItem.billingScheme

        if (pricingPlanLineItem.billingScheme === 'tiered') {
          assert(
            pricingPlanLineItem.tiers?.length,
            400,
            `Invalid pricing plan metric "${pricingPlanLineItemSlug}" for pricing plan "${pricingPlanSlug}": tiered billing schemes must have at least one tier.`
          )
          assert(
            !pricingPlanLineItem.transformQuantity,
            400,
            `Invalid pricing plan metric "${pricingPlanLineItemSlug}" for pricing plan "${pricingPlanSlug}": tiered billing schemes cannot have transformQuantity.`
          )

          priceParams.tiers_mode = pricingPlanLineItem.tiersMode
          priceParams.tiers = pricingPlanLineItem.tiers!.map((tierData) => {
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
          assert(
            !pricingPlanLineItem.tiers,
            400,
            `Invalid pricing plan metric "${pricingPlanLineItemSlug}" for pricing plan "${pricingPlanSlug}": per_unit billing schemes cannot have tiers.`
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

      const stripePrice = await stripe.prices.create(
        priceParams,
        ...stripeConnectParams
      )

      project._stripePriceIdMap[pricingPlanLineItemHashForStripePrice] =
        stripePrice.id
      dirty = true
    }

    assert(project._stripePriceIdMap[pricingPlanLineItemHashForStripePrice])
  }

  const upserts: Array<() => Promise<void>> = []

  // Validate deployment pricing plans to ensure they contain at least one valid
  // plan per pricing interval configured on the project.
  // TODO: move some of this `pricingPlanMap` validation to a separate function?
  // We really wouldn't want to create some resources and then fail partway when
  // this validation or some of the validation above fails.
  for (const pricingInterval of project.pricingIntervals) {
    const pricingPlans = getPricingPlansByInterval({
      pricingInterval,
      pricingPlanMap: deployment.pricingPlanMap
    })

    assert(
      pricingPlans.length > 0,
      400,
      `Invalid pricing config for deployment "${deployment.id}": no pricing plans for interval "${pricingInterval}"`
    )
  }

  for (const pricingPlan of Object.values(deployment.pricingPlanMap)) {
    for (const pricingPlanLineItem of Object.values(pricingPlan.metricsMap)) {
      upserts.push(() =>
        upsertStripeResourcesForPricingPlanLineItem({
          pricingPlan,
          pricingPlanLineItem
        })
      )
    }
  }

  await pAll(upserts, { concurrency: 4 })

  if (dirty) {
    await db
      .update(schema.projects)
      .set(project)
      .where(eq(schema.projects.id, project.id))
  }
}
