import { assert } from '@agentic/platform-core'
import {
  type AgenticProjectConfig,
  getPricingPlansByInterval,
  type PricingPlanLineItem
} from '@agentic/platform-schemas'

export function validatePricing({
  pricingIntervals,
  pricingPlans
}: Pick<AgenticProjectConfig, 'pricingIntervals' | 'pricingPlans'>) {
  assert(
    pricingPlans?.length,
    'Invalid pricingPlans: must be a non-empty array'
  )
  assert(
    pricingIntervals?.length,
    'Invalid pricingIntervals: must be a non-empty array'
  )

  {
    // Validate pricing interval
    const pricingIntervalsSet = new Set(pricingIntervals)
    assert(
      pricingIntervalsSet.size === pricingIntervals.length,
      'Invalid pricingIntervals: duplicate pricing intervals'
    )
    assert(
      pricingIntervals.length >= 1,
      'Invalid pricingIntervals: must contain at least one pricing interval'
    )

    if (pricingIntervals.length > 1) {
      for (const pricingPlan of pricingPlans) {
        if (pricingPlan.interval) {
          assert(
            pricingIntervalsSet.has(pricingPlan.interval),
            `Invalid pricingPlan "${pricingPlan.slug}": PricingPlan "${pricingPlan.slug}" has invalid interval "${pricingPlan.interval}" which is not included in the "pricingIntervals" array.`
          )
        }

        if (pricingPlan.slug === 'free') continue

        assert(
          pricingPlan.interval !== undefined,
          `Invalid pricingPlan "${pricingPlan.slug}": non-free PricingPlan "${pricingPlan.slug}" must specify an "interval" because the project supports multiple pricing intervals.`
        )
      }
    } else {
      // Only a single pricing interval is supported, so default all pricing
      // plans to use the default pricing interval.
      const defaultPricingInterval = pricingIntervals[0]!
      assert(
        defaultPricingInterval,
        'Invalid pricingIntervals: must contain at least one valid pricing interval'
      )

      for (const pricingPlan of pricingPlans) {
        if (pricingPlan.interval) {
          assert(
            pricingIntervalsSet.has(pricingPlan.interval),
            `Invalid pricingPlan "${pricingPlan.slug}": PricingPlan "${pricingPlan.slug}" has invalid interval "${pricingPlan.interval}" which is not included in the "pricingIntervals" array.`
          )
        }

        if (pricingPlan.slug === 'free') continue

        pricingPlan.interval ??= defaultPricingInterval
      }
    }
  }

  {
    // Validate pricingPlans
    const pricingPlanSlugsSet = new Set(pricingPlans.map((p) => p.slug))
    assert(
      pricingPlanSlugsSet.size === pricingPlans.length,
      'Invalid pricingPlans: duplicate PricingPlan slugs. All PricingPlan slugs must be unique (e.g. "free", "starter-monthly", "pro-annual", etc).'
    )

    const pricingPlanLineItemSlugMap: Record<string, PricingPlanLineItem[]> = {}

    for (const pricingPlan of pricingPlans) {
      const lineItemSlugsSet = new Set(
        pricingPlan.lineItems.map((lineItem) => lineItem.slug)
      )

      assert(
        lineItemSlugsSet.size === pricingPlan.lineItems.length,
        `Invalid pricingPlan "${pricingPlan.slug}": duplicate line-item slugs`
      )

      for (const lineItem of pricingPlan.lineItems) {
        if (!pricingPlanLineItemSlugMap[lineItem.slug]) {
          pricingPlanLineItemSlugMap[lineItem.slug] = []
        }

        pricingPlanLineItemSlugMap[lineItem.slug]!.push(lineItem)
      }
    }

    for (const lineItems of Object.values(pricingPlanLineItemSlugMap)) {
      if (lineItems.length <= 1) continue

      const lineItem0 = lineItems[0]!

      for (let i = 1; i < lineItems.length; ++i) {
        const lineItem = lineItems[i]!

        assert(
          lineItem.usageType === lineItem0.usageType,
          `Invalid pricingPlans: all PricingPlans which contain the same LineItems (by slug "${lineItem.slug}") must have the same usage type ("licensed" or "metered").`
        )
      }
    }
  }

  // Validate PricingPlanLineItems
  for (const pricingPlan of pricingPlans) {
    for (const lineItem of pricingPlan.lineItems) {
      if (lineItem.slug === 'base') {
        assert(
          lineItem.usageType === 'licensed',
          `Invalid PricingPlan "${pricingPlan.slug}": reserved LineItem "base" must have "licensed" usage type.`
        )
      } else if (lineItem.slug === 'requests') {
        assert(
          lineItem.usageType === 'metered',
          `Invalid PricingPlan "${pricingPlan.slug}": reserved "requests" LineItem "${lineItem.slug}" must have "metered" usage type.`
        )
      } else {
        assert(
          lineItem.slug.startsWith('custom-'),
          `Invalid PricingPlan "${pricingPlan.slug}": custom LineItem "${lineItem.slug}" must have a slug that starts with "custom-". This is required so that TypeScript can discriminate between custom and reserved line-items.`
        )
      }

      if (lineItem.usageType === 'metered') {
        switch (lineItem.billingScheme) {
          case 'per_unit':
            assert(
              (lineItem as any).unitAmount !== undefined,
              `Invalid PricingPlan "${pricingPlan.slug}": metered LineItem "${lineItem.slug}" must specify a non-negative "unitAmount" when using "per_unit" billing scheme.`
            )

            assert(
              (lineItem as any).tiersMode === undefined,
              `Invalid PricingPlan "${pricingPlan.slug}": metered LineItem "${lineItem.slug}" must not specify "tiersMode" when using "per_unit" billing scheme.`
            )

            assert(
              (lineItem as any).tiers === undefined,
              `Invalid PricingPlan "${pricingPlan.slug}": metered LineItem "${lineItem.slug}" must not specify "tiers" when using "per_unit" billing scheme.`
            )
            break

          case 'tiered':
            assert(
              (lineItem as any).unitAmount === undefined,
              `Invalid PricingPlan "${pricingPlan.slug}": metered LineItem "${lineItem.slug}" must not specify "unitAmount" when using "tiered" billing scheme.`
            )

            assert(
              (lineItem as any).tiers?.length,
              `Invalid PricingPlan "${pricingPlan.slug}": metered LineItem "${lineItem.slug}" must specify a non-empty "tiers" array when using "tiered" billing scheme.`
            )

            assert(
              (lineItem as any).tiersMode !== undefined,
              `Invalid PricingPlan "${pricingPlan.slug}": metered LineItem "${lineItem.slug}" must specify a valid "tiersMode" when using "tiered" billing scheme.`
            )

            // TODO: Not sure if this is a valid requirement or not. If it is, update
            // the corresponding type in the schemas package.
            // assert(
            //   lineItem.transformQuantity === undefined,
            //   `Invalid pricingPlan "${pricingPlan.slug}": metered LineItem "${lineItem.slug}" must not specify "transformQuantity" when using "tiered" billing scheme.`
            // )
            break

          default:
            assert(
              false,
              `Invalid PricingPlan "${pricingPlan.slug}": metered LineItem "${(lineItem as any).slug}" must specify a valid "billingScheme".`
            )
        }
      }
    }
  }

  // Validate deployment pricing plans to ensure they contain at least one valid
  // plan per pricing interval configured on the project.
  for (const pricingInterval of pricingIntervals) {
    const pricingPlansForInterval = getPricingPlansByInterval({
      pricingInterval,
      pricingPlans
    })

    assert(
      pricingPlansForInterval.length > 0,
      400,
      `Invalid pricing config: no pricing plans for pricing interval "${pricingInterval}"`
    )
  }
}
