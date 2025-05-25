import type { ZodTypeDef } from 'zod'
import { assert, parseZodSchema } from '@agentic/platform-core'
import {
  type AgenticProjectConfigInput,
  type AgenticProjectConfigOutput,
  agenticProjectConfigSchema,
  type PricingPlanLineItem
} from '@agentic/platform-schemas'

export async function validateAgenticConfig(
  inputConfig: unknown
): Promise<AgenticProjectConfigOutput> {
  const config = parseZodSchema<
    AgenticProjectConfigOutput,
    ZodTypeDef,
    AgenticProjectConfigInput
  >(agenticProjectConfigSchema, inputConfig)

  const { pricingIntervals, pricingPlans, originUrl } = config
  assert(
    pricingPlans?.length,
    'Invalid pricingPlans: must be a non-empty array'
  )
  assert(
    pricingIntervals?.length,
    'Invalid pricingIntervals: must be a non-empty array'
  )

  try {
    const parsedOriginUrl = new URL(originUrl)
    assert(
      parsedOriginUrl.protocol === 'https:',
      'Invalid originUrl: must be a valid https URL'
    )

    assert(parsedOriginUrl.hostname, 'Invalid originUrl: must be a valid URL')
  } catch (err) {
    throw new Error('Invalid originUrl: must be a valid https URL', {
      cause: err
    })
  }

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

        for (const lineItem of pricingPlan.lineItems) {
          lineItem.interval ??= pricingPlan.interval

          assert(
            lineItem.interval === pricingPlan.interval,
            `Invalid pricingPlan "${pricingPlan.slug}": non-free PricingPlan "${pricingPlan.slug}" LineItem "${lineItem.slug}" "interval" must match the PricingPlan interval "${pricingPlan.interval}" because the project supports multiple pricing intervals.`
          )

          assert(
            pricingIntervalsSet.has(lineItem.interval),
            `Invalid pricingPlan "${pricingPlan.slug}": PricingPlan "${pricingPlan.slug}" LineItem "${lineItem.slug}" has invalid interval "${pricingPlan.interval}" which is not included in the "pricingIntervals" array.`
          )
        }
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

        for (const lineItem of pricingPlan.lineItems) {
          lineItem.interval ??= defaultPricingInterval

          assert(
            pricingIntervalsSet.has(lineItem.interval),
            `Invalid pricingPlan "${pricingPlan.slug}": PricingPlan "${pricingPlan.slug}" LineItem "${lineItem.slug}" has invalid interval "${pricingPlan.interval}" which is not included in the "pricingIntervals" array.`
          )
        }
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
      if (lineItem.usageType === 'metered') {
        switch (lineItem.billingScheme) {
          case 'per_unit':
            assert(
              lineItem.unitAmount !== undefined,
              `Invalid pricingPlan "${pricingPlan.slug}": metered LineItem "${lineItem.slug}" must specify a non-negative "unitAmount" when using "per_unit" billing scheme.`
            )

            assert(
              lineItem.tiersMode === undefined,
              `Invalid pricingPlan "${pricingPlan.slug}": metered LineItem "${lineItem.slug}" must not specify "tiersMode" when using "per_unit" billing scheme.`
            )

            assert(
              lineItem.tiers === undefined,
              `Invalid pricingPlan "${pricingPlan.slug}": metered LineItem "${lineItem.slug}" must not specify "tiers" when using "per_unit" billing scheme.`
            )
            break

          case 'tiered':
            assert(
              lineItem.unitAmount === undefined,
              `Invalid pricingPlan "${pricingPlan.slug}": metered LineItem "${lineItem.slug}" must not specify "unitAmount" when using "tiered" billing scheme.`
            )

            assert(
              lineItem.tiers?.length,
              `Invalid pricingPlan "${pricingPlan.slug}": metered LineItem "${lineItem.slug}" must specify a non-empty "tiers" array when using "tiered" billing scheme.`
            )

            assert(
              lineItem.tiersMode !== undefined,
              `Invalid pricingPlan "${pricingPlan.slug}": metered LineItem "${lineItem.slug}" must specify a valid "tiersMode" when using "tiered" billing scheme.`
            )

            assert(
              lineItem.transformQuantity === undefined,
              `Invalid pricingPlan "${pricingPlan.slug}": metered LineItem "${lineItem.slug}" must not specify "transformQuantity" when using "tiered" billing scheme.`
            )
            break

          default:
            assert(
              false,
              `Invalid pricingPlan "${pricingPlan.slug}": metered LineItem "${lineItem.slug}" must specify a valid "billingScheme".`
            )
        }
      }
    }
  }

  return config
}
