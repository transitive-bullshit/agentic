import type Stripe from 'stripe'
import pAll from 'p-all'

import { db, eq, type RawDeployment, type RawProject, schema } from '@/db'
import {
  getPricingPlanMetricHash,
  type PricingPlan,
  type PricingPlanMetric
} from '@/db/schema'
import { stripe } from '@/lib/stripe'
import { assert } from '@/lib/utils'

export async function upsertStripeProductsAndPricing({
  deployment,
  project
}: {
  deployment: RawDeployment
  project: RawProject
}): Promise<void> {
  const stripeConnectParams = project._stripeAccountId
    ? [
        {
          stripeAccount: project._stripeAccountId
        }
      ]
    : []
  let dirty = false

  async function upsertStripeProductAndPricingForMetric({
    pricingPlan,
    pricingPlanMetric
  }: {
    pricingPlan: PricingPlan
    pricingPlanMetric: PricingPlanMetric
  }) {
    const { slug: pricingPlanSlug } = pricingPlan // TODO
    const { slug: pricingPlanMetricSlug } = pricingPlanMetric

    const pricingPlanMetricHash = getPricingPlanMetricHash({
      pricingPlanMetric,
      project
    })

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

    // Upsert the Stripe Meter
    if (
      pricingPlanMetric.usageType === 'metered' &&
      !project._stripeMeterIdMap[pricingPlanMetricSlug]
    ) {
      const meter = await stripe.billing.meters.create(
        {
          display_name: `${project.id} ${pricingPlanMetric.label || pricingPlanMetricSlug}`,
          event_name: `meter-${project.id}-${pricingPlanMetricSlug}`,
          default_aggregation: {
            formula: 'sum'
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

      project._stripeMeterIdMap[pricingPlanMetricSlug] = meter.id
      dirty = true
    }

    assert(
      pricingPlanMetric.usageType === 'licensed' ||
        project._stripeMeterIdMap[pricingPlanMetricSlug]
    )

    // Upsert the Stripe Price
    if (!project._stripePriceIdMap[pricingPlanMetricHash]) {
      const priceParams: Stripe.PriceCreateParams = {
        nickname: `price-${project.id}-${pricingPlan.slug}-${pricingPlanMetricSlug}`,
        product: project._stripeProductIdMap[pricingPlanMetricSlug],
        currency: project.pricingCurrency,
        recurring: {
          interval: pricingPlanMetric.interval,

          // TODO: support this
          interval_count: 1,

          usage_type: pricingPlanMetric.usageType
        }
      }

      if (pricingPlanMetric.usageType === 'licensed') {
        priceParams.unit_amount_decimal = pricingPlanMetric.amount.toFixed(12)
      } else {
        priceParams.billing_scheme = pricingPlanMetric.billingScheme

        if (pricingPlanMetric.billingScheme === 'tiered') {
          assert(
            pricingPlanMetric.tiers,
            `Invalid pricing plan metric: ${pricingPlanMetricSlug}`
          )

          priceParams.tiers_mode = pricingPlanMetric.tiersMode
          priceParams.tiers = pricingPlanMetric.tiers!.map((tier) => {
            const result: Stripe.PriceCreateParams.Tier = {
              up_to: tier.upTo
            }

            if (tier.unitAmount !== undefined) {
              result.unit_amount_decimal = tier.unitAmount.toFixed(12)
            }

            if (tier.flatAmount !== undefined) {
              result.flat_amount_decimal = tier.flatAmount.toFixed(12)
            }

            return result
          })
        }
      }

      const stripePrice = await stripe.prices.create(
        priceParams,
        ...stripeConnectParams
      )

      project._stripePriceIdMap[pricingPlanMetricHash] = stripePrice.id
      dirty = true
    }

    assert(project._stripePriceIdMap[pricingPlanMetricHash])
  }

  const upserts: Array<() => Promise<void>> = []

  for (const pricingInterval of project.pricingIntervals) {
    const pricingPlanMap = deployment.pricingPlanMapByInterval[pricingInterval]
    assert(
      pricingPlanMap,
      `Invalid pricing config for deployment "${deployment.id}": missing pricing plan map for interval "${pricingInterval}"`
    )

    for (const pricingPlan of Object.values(pricingPlanMap)) {
      for (const pricingPlanMetric of Object.values(pricingPlan.metricsMap)) {
        upserts.push(() =>
          upsertStripeProductAndPricingForMetric({
            pricingPlan,
            pricingPlanMetric
          })
        )
      }
    }
  }

  await pAll(upserts, { concurrency: 4 })

  if (dirty) {
    await Promise.all([
      db
        .update(schema.projects)
        .set(project)
        .where(eq(schema.projects.id, project.id)),

      db
        .update(schema.deployments)
        .set(deployment)
        .where(eq(schema.deployments.id, deployment.id))
    ])
  }
}
