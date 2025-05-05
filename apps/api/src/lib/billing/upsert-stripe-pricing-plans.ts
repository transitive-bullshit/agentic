import type Stripe from 'stripe'
import pAll from 'p-all'

import type { PricingPlan, PricingPlanMetric } from '@/db/schema'
import { db, eq, type RawDeployment, type RawProject, schema } from '@/db'
import { stripe } from '@/lib/stripe'
import { assert } from '@/lib/utils'

// TODO: move these to config
const currency = 'usd'
const interval = 'month'

export async function upsertStripePricingPlans({
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

  async function upsertStripeBaseProduct() {
    if (!project.stripeBaseProductId) {
      const product = await stripe.products.create(
        {
          name: `${project.id} base`,
          type: 'service'
        },
        ...stripeConnectParams
      )

      project.stripeBaseProductId = product.id
      dirty = true
    }
  }

  async function upsertStripeRequestProduct() {
    if (!project.stripeRequestProductId) {
      const product = await stripe.products.create(
        {
          name: `${project.id} requests`,
          type: 'service',
          unit_label: 'request'
        },
        ...stripeConnectParams
      )

      project.stripeRequestProductId = product.id
      dirty = true
    }
  }

  async function upsertStripeMetricProduct(metric: PricingPlanMetric) {
    const { slug: metricSlug } = metric

    if (!project.stripeMetricProductIds[metricSlug]) {
      const product = await stripe.products.create(
        {
          name: `${project.id} ${metricSlug}`,
          type: 'service',
          unit_label: metric.unitLabel
        },
        ...stripeConnectParams
      )

      project.stripeMetricProductIds[metricSlug] = product.id
      dirty = true
    }
  }

  async function upsertStripeBasePlan(pricingPlan: PricingPlan) {
    if (!pricingPlan.stripeBasePlanId) {
      const hash = pricingPlan.baseId
      const stripePlan = project._stripePlanIds[hash]
      assert(stripePlan, 400, 'Missing stripe base plan')

      pricingPlan.stripeBasePlanId = stripePlan.basePlanId
      dirty = true

      if (!pricingPlan.stripeBasePlanId) {
        const stripePlan = await stripe.plans.create(
          {
            product: project.stripeBaseProductId,
            currency,
            interval,
            amount_decimal: pricingPlan.amount.toFixed(12),
            nickname: `${project.id}-${pricingPlan.slug}-base`
          },
          ...stripeConnectParams
        )

        pricingPlan.stripeBasePlanId = stripePlan.id
        project._stripePlanIds[hash]!.basePlanId = stripePlan.id
      }
    }
  }

  async function upsertStripeRequestPlan(pricingPlan: PricingPlan) {
    const { requests } = pricingPlan

    if (!pricingPlan.stripeRequestPlanId) {
      const hash = pricingPlan.requestsId
      const projectStripePlan = project._stripePlanIds[hash]
      assert(projectStripePlan, 400, 'Missing stripe request plan')

      pricingPlan.stripeRequestPlanId = projectStripePlan.requestPlanId
      dirty = true

      if (!pricingPlan.stripeRequestPlanId) {
        const planParams: Stripe.PlanCreateParams = {
          product: project.stripeRequestProductId,
          currency,
          interval,
          usage_type: 'metered',
          billing_scheme: requests.billingScheme,
          nickname: `${project.id}-${pricingPlan.slug}-requests`
        }

        if (requests.billingScheme === 'tiered') {
          planParams.tiers_mode = requests.tiersMode
          planParams.tiers = requests.tiers.map((tier) => {
            const result: Stripe.PlanCreateParams.Tier = {
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
        } else {
          planParams.amount_decimal = requests.amount.toFixed(12)
        }

        const stripePlan = await stripe.plans.create(
          planParams,
          ...stripeConnectParams
        )

        pricingPlan.stripeRequestPlanId = stripePlan.id
        projectStripePlan.requestPlanId = stripePlan.id
      }
    }
  }

  async function upsertStripeMetricPlan(
    pricingPlan: PricingPlan,
    metric: PricingPlanMetric
  ) {
    const { slug: metricSlug } = metric

    if (!pricingPlan.stripeMetricPlans[metricSlug]) {
      const hash = pricingPlan.metricIds[metricSlug]
      assert(hash, 500, `Missing stripe metric "${metricSlug}"`)

      const projectStripePlan = project._stripePlanIds[hash]
      assert(projectStripePlan, 500, 'Missing stripe request plan')

      // TODO: is this right? differs from original source
      pricingPlan.stripeMetricPlans[metricSlug] = projectStripePlan.basePlanId
      dirty = true

      if (!pricingPlan.stripeMetricPlans[metricSlug]) {
        const stripeProductId = project.stripeMetricProductIds[metricSlug]
        assert(
          stripeProductId,
          500,
          `Missing stripe product ID for metric "${metricSlug}"`
        )

        const planParams: Stripe.PlanCreateParams = {
          product: stripeProductId,
          currency,
          interval,
          usage_type: metric.usageType,
          billing_scheme: metric.billingScheme,
          nickname: `${project.id}-${pricingPlan.slug}-${metricSlug}`
        }

        if (metric.billingScheme === 'tiered') {
          planParams.tiers_mode = metric.tiersMode
          planParams.tiers = metric.tiers.map((tier) => {
            const result: Stripe.PlanCreateParams.Tier = {
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
        } else {
          planParams.amount_decimal = metric.amount.toFixed(12)
        }

        const stripePlan = await stripe.plans.create(
          planParams,
          ...stripeConnectParams
        )

        pricingPlan.stripeMetricPlans[metricSlug] = stripePlan.id
        projectStripePlan.basePlanId = stripePlan.id
      }
    }
  }

  await Promise.all([upsertStripeBaseProduct(), upsertStripeRequestProduct()])

  const upserts = []
  for (const pricingPlan of deployment.pricingPlans) {
    upserts.push(() => upsertStripeBasePlan(pricingPlan))
    upserts.push(() => upsertStripeRequestPlan(pricingPlan))

    for (const metric of pricingPlan.metrics) {
      upserts.push(async () => {
        await upsertStripeMetricProduct(metric)
        return upsertStripeMetricPlan(pricingPlan, metric)
      })
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
