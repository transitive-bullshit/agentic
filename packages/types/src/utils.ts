import type {
  PricingInterval,
  PricingPlan,
  PricingPlanList
} from '@agentic/platform-types'

export function getPricingPlansByInterval({
  pricingInterval,
  pricingPlans
}: {
  pricingInterval: PricingInterval
  pricingPlans: PricingPlanList
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
