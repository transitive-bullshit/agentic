import type { PricingInterval, PricingPlan } from '@agentic/platform-types'

export function getPricingPlansByInterval({
  pricingInterval,
  pricingPlans
}: {
  pricingInterval: PricingInterval
  pricingPlans: PricingPlan[]
}): PricingPlan[] {
  return pricingPlans.filter(
    (pricingPlan) =>
      pricingPlan.interval === pricingInterval ||
      pricingPlan.interval === undefined
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
