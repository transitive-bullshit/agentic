import type Stripe from 'stripe'
import pAll from 'p-all'

import { db, eq, type RawDeployment, type RawProject, schema } from '@/db'
import {
  getLabelForPricingInterval,
  getPricingPlanMetricHashForStripePrice,
  getPricingPlansByInterval,
  type PricingPlan,
  type PricingPlanMetric
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

  async function upsertStripeResourcesForPricingPlanMetric({
    pricingPlan,
    pricingPlanMetric
  }: {
    pricingPlan: PricingPlan
    pricingPlanMetric: PricingPlanMetric
  }) {
    const { slug: pricingPlanSlug } = pricingPlan
    const { slug: pricingPlanMetricSlug } = pricingPlanMetric

    // Upsert the Stripe Product
    if (!project._stripeProductIdMap[pricingPlanMetricSlug]) {
      const productParams: Stripe.ProductCreateParams = {
        name: `${project.id} ${pricingPlanMetricSlug}`,
        type: 'service',
        metadata: {
          projectId: project.id,
          pricingPlanMetricSlug
        }
      }

      if (pricingPlanMetric.usageType === 'licensed') {
        productParams.unit_label = pricingPlanMetric.label
      } else {
        productParams.unit_label = pricingPlanMetric.unitLabel
      }

      const product = await stripe.products.create(
        productParams,
        ...stripeConnectParams
      )

      project._stripeProductIdMap[pricingPlanMetricSlug] = product.id
      dirty = true
    }

    assert(project._stripeProductIdMap[pricingPlanMetricSlug])

    if (pricingPlanMetric.usageType === 'metered') {
      // Upsert the Stripe Meter
      if (!project._stripeMeterIdMap[pricingPlanMetricSlug]) {
        const stripeMeter = await stripe.billing.meters.create(
          {
            display_name: `${project.id} ${pricingPlanMetric.label || pricingPlanMetricSlug}`,
            event_name: `meter-${project.id}-${pricingPlanMetricSlug}`,
            // TODO: This currently isn't taken into account for the slug, so if it
            // changes across deployments, the meter will not be updated.
            default_aggregation: {
              formula: pricingPlanMetric.defaultAggregation?.formula ?? 'sum'
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

        project._stripeMeterIdMap[pricingPlanMetricSlug] = stripeMeter.id
        dirty = true
      }

      assert(project._stripeMeterIdMap[pricingPlanMetricSlug])
    } else {
      assert(pricingPlanMetric.usageType === 'licensed', 400)

      assert(
        !project._stripeMeterIdMap[pricingPlanMetricSlug],
        400,
        `Invalid pricing plan metric "${pricingPlanMetricSlug}" for pricing plan "${pricingPlanSlug}": licensed pricing plan metrics cannot replace a previous metered pricing plan metric. Use a different pricing plan metric slug for the new licensed plan.`
      )
    }

    const pricingPlanMetricHashForStripePrice =
      getPricingPlanMetricHashForStripePrice({
        pricingPlan,
        pricingPlanMetric,
        project
      })

    // Upsert the Stripe Price
    if (!project._stripePriceIdMap[pricingPlanMetricHashForStripePrice]) {
      const interval =
        pricingPlanMetric.interval ?? project.defaultPricingInterval

      const nickname = [
        'price',
        project.id,
        pricingPlanMetricSlug,
        getLabelForPricingInterval(interval)
      ]
        .filter(Boolean)
        .join('-')

      const priceParams: Stripe.PriceCreateParams = {
        nickname,
        product: project._stripeProductIdMap[pricingPlanMetricSlug],
        currency: project.pricingCurrency,
        recurring: {
          interval,

          // TODO: support this
          interval_count: 1,

          usage_type: pricingPlanMetric.usageType,

          meter: project._stripeMeterIdMap[pricingPlanMetricSlug]
        },
        metadata: {
          projectId: project.id,
          pricingPlanMetricSlug
        }
      }

      if (pricingPlanMetric.usageType === 'licensed') {
        priceParams.unit_amount_decimal = pricingPlanMetric.amount.toFixed(12)
      } else {
        priceParams.billing_scheme = pricingPlanMetric.billingScheme

        if (pricingPlanMetric.billingScheme === 'tiered') {
          assert(
            pricingPlanMetric.tiers?.length,
            400,
            `Invalid pricing plan metric "${pricingPlanMetricSlug}" for pricing plan "${pricingPlanSlug}": tiered billing schemes must have at least one tier.`
          )
          assert(
            !pricingPlanMetric.transformQuantity,
            400,
            `Invalid pricing plan metric "${pricingPlanMetricSlug}" for pricing plan "${pricingPlanSlug}": tiered billing schemes cannot have transformQuantity.`
          )

          priceParams.tiers_mode = pricingPlanMetric.tiersMode
          priceParams.tiers = pricingPlanMetric.tiers!.map((tierData) => {
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
            pricingPlanMetric.billingScheme === 'per_unit',
            400,
            `Invalid pricing plan metric "${pricingPlanMetricSlug}" for pricing plan "${pricingPlanSlug}": invalid billing scheme.`
          )
          assert(
            pricingPlanMetric.unitAmount !== undefined,
            400,
            `Invalid pricing plan metric "${pricingPlanMetricSlug}" for pricing plan "${pricingPlanSlug}": unitAmount is required for per_unit billing schemes.`
          )
          assert(
            !pricingPlanMetric.tiers,
            400,
            `Invalid pricing plan metric "${pricingPlanMetricSlug}" for pricing plan "${pricingPlanSlug}": per_unit billing schemes cannot have tiers.`
          )

          priceParams.unit_amount_decimal =
            pricingPlanMetric.unitAmount.toFixed(12)

          if (pricingPlanMetric.transformQuantity) {
            priceParams.transform_quantity = {
              divide_by: pricingPlanMetric.transformQuantity.divideBy,
              round: pricingPlanMetric.transformQuantity.round
            }
          }
        }
      }

      const stripePrice = await stripe.prices.create(
        priceParams,
        ...stripeConnectParams
      )

      project._stripePriceIdMap[pricingPlanMetricHashForStripePrice] =
        stripePrice.id
      dirty = true
    }

    assert(project._stripePriceIdMap[pricingPlanMetricHashForStripePrice])
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
    for (const pricingPlanMetric of Object.values(pricingPlan.metricsMap)) {
      upserts.push(() =>
        upsertStripeResourcesForPricingPlanMetric({
          pricingPlan,
          pricingPlanMetric
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
