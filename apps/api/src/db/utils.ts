import type {
  PricingPlan,
  PricingPlanLineItem
} from '@agentic/platform-schemas'
import { hashObject } from '@agentic/platform-core'

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
