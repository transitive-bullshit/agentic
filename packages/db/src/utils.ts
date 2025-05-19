import { hashObject } from '@agentic/platform-core'

import type {
  PricingInterval,
  PricingPlan,
  PricingPlanLineItem,
  PricingPlanList
} from './schema/schemas'
import type { RawProject } from './types'

/**
 * Gets the hash used to uniquely map a PricingPlanLineItem to its
 * corresponding Stripe Price in a stable way across deployments within a
 * project.
 *
 * This hash is used as the key for the `Project._stripePriceIdMap`.
 */
export function getPricingPlanLineItemHashForStripePrice({
  pricingPlan,
  pricingPlanLineItem,
  project
}: {
  pricingPlan: PricingPlan
  pricingPlanLineItem: PricingPlanLineItem
  project: RawProject
}) {
  // TODO: use pricingPlan.slug as well here?
  // TODO: not sure if this is needed or not...
  // With pricing plan slug:
  //   - 'price:free:base:<hash>'
  //   - 'price:basic-monthly:base:<hash>'
  //   - 'price:basic-monthly:requests:<hash>'
  // Without pricing plan slug:
  //   - 'price:base:<hash>'
  //   - 'price:base:<hash>'
  //   - 'price:requests:<hash>'

  const hash = hashObject({
    ...pricingPlanLineItem,
    projectId: project.id,
    stripeAccountId: project._stripeAccountId,
    currency: project.pricingCurrency
  })

  return `price:${pricingPlan.slug}:${pricingPlanLineItem.slug}:${hash}`
}

export function getStripePriceIdForPricingPlanLineItem({
  pricingPlan,
  pricingPlanLineItem,
  project
}: {
  pricingPlan: PricingPlan
  pricingPlanLineItem: PricingPlanLineItem
  project: RawProject
}): string | undefined {
  const pricingPlanLineItemHash = getPricingPlanLineItemHashForStripePrice({
    pricingPlan,
    pricingPlanLineItem,
    project
  })

  return project._stripePriceIdMap[pricingPlanLineItemHash]
}

export function getPricingPlansByInterval({
  pricingInterval,
  pricingPlans
}: {
  pricingInterval: PricingInterval
  pricingPlans: PricingPlanList
}): PricingPlan[] {
  return pricingPlans.filter(
    (pricingPlan) =>
      pricingPlan.interval === undefined ||
      pricingPlan.interval === pricingInterval
  )
}

const pricingIntervalToLabelMap: Record<PricingInterval, string> = {
  day: 'daily',
  week: 'weekly',
  month: 'monthly',
  year: 'yearly'
}

export function getLabelForPricingInterval(
  pricingInterval: PricingInterval
): string {
  return pricingIntervalToLabelMap[pricingInterval]
}
