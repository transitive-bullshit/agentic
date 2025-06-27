import type { Simplify } from 'type-fest'
import { z } from '@hono/zod-openapi'

import { type RateLimit, rateLimitSchema } from './rate-limit'

/**
 * PricingPlanTier is a single tier in a tiered pricing plan.
 */
export const pricingPlanTierSchema = z
  .object({
    unitAmount: z.number().optional(),
    flatAmount: z.number().optional(),
    upTo: z.union([z.number(), z.literal('inf')])
  })
  .refine(
    (data) =>
      (data.unitAmount !== undefined) !== (data.flatAmount !== undefined),
    {
      message: 'Either unitAmount or flatAmount must be provided, but not both'
    }
  )
  .openapi('PricingPlanTier')
export type PricingPlanTier = z.infer<typeof pricingPlanTierSchema>

/**
 * The frequency at which a subscription is billed.
 */
export const pricingIntervalSchema = z
  .union([
    z.literal('day'),
    z.literal('week'),
    z.literal('month'),
    z.literal('year')
  ])
  .describe('The frequency at which a subscription is billed.')
  .openapi('PricingInterval')
export type PricingInterval = z.infer<typeof pricingIntervalSchema>

/**
 * List of billing intervals for subscriptions.
 */
export const pricingIntervalListSchema = z
  .array(pricingIntervalSchema)
  .nonempty({
    message: 'Must contain at least one pricing interval'
  })
  .describe('List of billing intervals for subscriptions.')

/**
 * Internal PricingPlanLineItem hash
 *
 * @internal
 */
export const pricingPlanLineItemHashSchema = z
  .string()
  .nonempty()
  .describe('Internal PricingPlanLineItem hash')

/**
 * PricingPlanLineItem slug which acts as a unique lookup key for LineItems
 * across deployments. They must be lower and kebab-cased ("base", "requests",
 * "image-transformations", etc).
 */
export const pricingPlanLineItemSlugSchema = z
  .string()
  .nonempty()
  .describe(
    'PricingPlanLineItem slug which acts as a unique lookup key for LineItems across deployments. They must be lower and kebab-cased ("base", "requests", "image-transformations").'
  )

/**
 * PricingPlan slug which acts as a unique lookup key for PricingPlans across deployments. They must be lower and kebab-cased and should have the interval as a suffix ("free", "starter-monthly", "pro-annual").
 */
export const pricingPlanSlugSchema = z
  .string()
  .nonempty()
  .describe(
    'PricingPlan slug which acts as a unique lookup key for PricingPlans across deployments. They must be lower and kebab-cased and should have the interval as a suffix ("free", "starter-monthly", "pro-annual").'
  )

/**
 * Map from internal PricingPlanLineItem **hash** to Stripe Price id
 */
export const stripePriceIdMapSchema = z
  .record(pricingPlanLineItemHashSchema, z.string().describe('Stripe Price id'))
  .describe('Map from internal PricingPlanLineItem **hash** to Stripe Price id')
  .openapi('StripePriceIdMap')
export type StripePriceIdMap = z.infer<typeof stripePriceIdMapSchema>

/**
 * Map from internal PricingPlanLineItem **slug** to Stripe Meter id
 */
export const stripeMeterIdMapSchema = z
  .record(pricingPlanLineItemHashSchema, z.string().describe('Stripe Meter id'))
  .describe('Map from internal PricingPlanLineItem **slug** to Stripe Meter id')
  .openapi('StripeMeterIdMap')
export type StripeMeterIdMap = z.infer<typeof stripeMeterIdMapSchema>

// export const pricingPlanLineItemTypeSchema = z.union([
//   z.literal('base'),
//   z.literal('requests'),
//   z.literal('custom')
// ])
// export type PricingPlanLineItemType = z.infer<
//   typeof pricingPlanLineItemTypeSchema
// >
export type CustomPricingPlanLineItemSlug = `custom-${string}`

const commonPricingPlanLineItemSchema = z.object({
  /**
   * Slugs act as the primary key for LineItems. They should be lower-cased and
   * kebab-cased ("base", "requests", "image-transformations").
   *
   * The `base` slug is reserved for a plan's default `licensed` line-item.
   *
   * The `requests` slug is reserved for charging using `metered` billing based
   * on the number of request made during a given billing interval.
   *
   * All other PricingPlanLineItem `slugs` are considered custom LineItems.
   *
   * Should be stable across deployments, so if a slug refers to one type of
   * product / line-item / metric in one deployment, it should refer to the same
   * product / line-item / metric in future deployments, even if they are
   * configured differently. If you are switching between a licensed and metered
   * line-item across deployments, they must use different slugs.
   */
  slug: z.string(),

  /**
   * Optional label for the line-item which will be displayed on customer bills.
   *
   * If unset, the line-item's `slug` will be used as the label.
   */
  label: z.string().optional().openapi('label', { example: 'API calls' })
})

/**
 * Licensed LineItems are used to charge for fixed-price services.
 */
export const pricingPlanLicensedLineItemSchema =
  commonPricingPlanLineItemSchema.merge(
    z.object({
      /**
       * Licensed LineItems are used to charge for fixed-price services.
       */
      usageType: z.literal('licensed'),

      /**
       * The fixed amount to charge per billing interval.
       *
       * Specified in the smallest currency unit (e.g. cents for USD).
       *
       * So 100 = $1.00 USD, 1000 = $10.00 USD, etc.
       */
      amount: z.number().nonnegative()
    })
  )

/**
 * Metered LineItems are used to charge for usage-based services.
 */
export const pricingPlanMeteredLineItemSchema =
  commonPricingPlanLineItemSchema.merge(
    z.object({
      /**
       * Metered LineItems are used to charge for usage-based services.
       */
      usageType: z.literal('metered'),

      /**
       * Optional label for the line-item which will be displayed on customer
       * bills.
       *
       * If unset, the line-item's `slug` will be used as the unit label.
       */
      unitLabel: z.string().optional(),

      /**
       * Describes how to compute the price per period. Either `per_unit` or
       * `tiered`.
       *
       * `per_unit` indicates that the fixed amount (specified in
       * `unitAmount`) will be charged per unit of total usage.
       *
       * `tiered` indicates that the unit pricing will be computed using a
       * tiering strategy as defined using `tiers` and `tiersMode`.
       */
      billingScheme: z.union([z.literal('per_unit'), z.literal('tiered')]),

      /**
       * The fixed amount to charge per unit of usage.
       *
       * Only applicable for `per_unit` billing schemes.
       *
       * Specified in the smallest currency unit (e.g. cents for USD).
       *
       * So 100 = $1.00 USD, 1000 = $10.00 USD, etc.
       */
      unitAmount: z.number().nonnegative().optional(),

      // Only applicable for `tiered` billing schemes

      /**
       * Defines if the tiering price should be `graduated` or `volume` based.
       *
       * In `volume`-based tiering, the maximum quantity within a period
       * determines the per unit price.
       *
       * In `graduated`-based tiering, the per-unit price changes successively
       * as the quantity grows.
       *
       * This field requires `billingScheme` to be set to `tiered`.
       */
      tiersMode: z
        .union([z.literal('graduated'), z.literal('volume')])
        .optional(),

      /**
       * Pricing tiers for `tiered` billing schemes.
       *
       * This field requires `billingScheme` to be set to `tiered`.
       */
      tiers: z.array(pricingPlanTierSchema).nonempty().optional(),

      // TODO: add support for tiered rate limits?

      /**
       * The default settings to aggregate the Stripe Meter's events with.
       *
       * Deafults to `{ formula: 'sum' }`.
       */
      defaultAggregation: z
        .object({
          /**
           * Specifies how events are aggregated for a Stripe Meter.
           * Allowed values are `count` to count the number of events and `sum`
           * to sum each event's value .
           *
           * Defaults to `sum`.
           */
          formula: z
            .union([z.literal('sum'), z.literal('count')])
            .default('sum')
        })
        .optional(),

      /**
       * Optionally apply a transformation to the reported usage or set
       * quantity before computing the amount billed. Cannot be combined
       * with `tiers`.
       */
      transformQuantity: z
        .object({
          /**
           * Divide usage by this number.
           *
           * Must be a positive number.
           */
          divideBy: z.number().positive(),

          /**
           * After division, either round the result `up` or `down`.
           */
          round: z.union([z.literal('down'), z.literal('up')])
        })
        .optional()
    })
  )

/**
 * PricingPlanLineItems represent a single line-item in a Stripe Subscription.
 *
 * They map to a Stripe billing `Price` and possibly a corresponding Stripe
 * `Meter` for metered usage.
 */
export const pricingPlanLineItemSchema = z
  .discriminatedUnion('usageType', [
    pricingPlanLicensedLineItemSchema,
    pricingPlanMeteredLineItemSchema
  ])
  .refine(
    (data) => {
      if (data.slug === 'base') {
        return data.usageType === 'licensed'
      }

      return true
    },
    (data) => ({
      message: `Invalid PricingPlanLineItem "${data.slug}": reserved "base" LineItems must have "licensed" usage type.`
    })
  )
  .refine(
    (data) => {
      if (data.slug === 'requests') {
        return data.usageType === 'metered'
      }

      return true
    },
    (data) => ({
      message: `Invalid PricingPlanLineItem "${data.slug}": reserved "requests" LineItems must have "metered" usage type.`
    })
  )
  .refine(
    (data) => {
      if (data.slug !== 'base' && data.slug !== 'requests') {
        return data.slug.startsWith('custom-')
      }

      return true
    },
    (data) => ({
      message: `Invalid PricingPlanLineItem "${data.slug}": custom line-item slugs must start with "custom-". This is required so that TypeScript can discriminate between custom and reserved line-items.`
    })
  )
  .describe(
    'PricingPlanLineItems represent a single line-item in a Stripe Subscription. They map to a Stripe billing `Price` and possibly a corresponding Stripe `Meter` for usage-based line-items.'
  )
  .openapi('PricingPlanLineItem')
// export type PricingPlanLineItem = z.infer<typeof pricingPlanLineItemSchema>

// These are more complex discriminated unions based on: `slug`, `usageType`,
// and `billingScheme`. That's why we're not using zod's inference directly
// for these types. See `./pricing.test.ts` for examples.
export type PricingPlanLineItemInput =
  // "base" licensed line-item
  | Simplify<
      {
        slug: 'base'
      } & z.input<typeof pricingPlanLicensedLineItemSchema>
    >
  // "custom" licensed line-item
  | Simplify<
      {
        slug: CustomPricingPlanLineItemSlug
        usageType: 'licensed'
      } & z.input<typeof pricingPlanLicensedLineItemSchema>
    >
  // "requests" metered per-unit line-item
  | Simplify<
      {
        slug: 'requests'
        usageType: 'metered'
        billingScheme: 'per_unit'
        unitAmount: number
      } & Omit<
        z.input<typeof pricingPlanMeteredLineItemSchema> & {
          billingScheme: 'per_unit'
        },
        'tiers' | 'tiersMode'
      >
    >
  // "requests" metered tiered line-item
  | Simplify<
      {
        slug: 'requests'
        usageType: 'metered'
        billingScheme: 'tiered'
      } & Omit<
        z.input<typeof pricingPlanMeteredLineItemSchema> & {
          billingScheme: 'tiered'
        },
        'unitAmount' | 'transformQuantity'
      >
    >
  // "custom" metered per-unit line-item
  | Simplify<
      {
        slug: CustomPricingPlanLineItemSlug
        usageType: 'metered'
        billingScheme: 'per_unit'
        unitAmount: number
      } & Omit<
        z.input<typeof pricingPlanMeteredLineItemSchema> & {
          billingScheme: 'per_unit'
        },
        'tiers' | 'tiersMode'
      >
    >
  // "custom" metered tiered line-item
  | Simplify<
      {
        slug: CustomPricingPlanLineItemSlug
        usageType: 'metered'
        billingScheme: 'tiered'
      } & Omit<
        z.input<typeof pricingPlanMeteredLineItemSchema> & {
          billingScheme: 'tiered'
        },
        'unitAmount' | 'transformQuantity'
      >
    >

export type PricingPlanLineItem =
  // "base" licensed line-item
  | Simplify<
      {
        slug: 'base'
      } & z.infer<typeof pricingPlanLicensedLineItemSchema>
    >
  // "custom" licensed line-item
  | Simplify<
      {
        slug: CustomPricingPlanLineItemSlug
        usageType: 'licensed'
      } & z.infer<typeof pricingPlanLicensedLineItemSchema>
    >
  // "requests" metered per-unit line-item
  | Simplify<
      {
        slug: 'requests'
        usageType: 'metered'
        billingScheme: 'per_unit'
        unitAmount: number
      } & Omit<
        z.infer<typeof pricingPlanMeteredLineItemSchema> & {
          billingScheme: 'per_unit'
        },
        'tiers' | 'tiersMode'
      >
    >
  // "requests" metered tiered line-item
  | Simplify<
      {
        slug: 'requests'
        usageType: 'metered'
        billingScheme: 'tiered'
      } & Omit<
        z.infer<typeof pricingPlanMeteredLineItemSchema> & {
          billingScheme: 'tiered'
        },
        'unitAmount' | 'transformQuantity'
      >
    >
  // "custom" metered per-unit line-item
  | Simplify<
      {
        slug: CustomPricingPlanLineItemSlug
        usageType: 'metered'
        billingScheme: 'per_unit'
        unitAmount: number
      } & Omit<
        z.infer<typeof pricingPlanMeteredLineItemSchema> & {
          billingScheme: 'per_unit'
        },
        'tiers' | 'tiersMode'
      >
    >
  // "custom" metered tiered line-item
  | Simplify<
      {
        slug: CustomPricingPlanLineItemSlug
        usageType: 'metered'
        billingScheme: 'tiered'
      } & Omit<
        z.infer<typeof pricingPlanMeteredLineItemSchema> & {
          billingScheme: 'tiered'
        },
        'unitAmount' | 'transformQuantity'
      >
    >

/**
 * Represents the config for a single Stripe subscription plan with one or more
 * LineItems.
 */
export const pricingPlanSchema = z
  .object({
    /**
     * Display name for the pricing plan.
     *
     * Used in UI and billing invoices.
     *
     * @required
     * @example "Free"
     * @example "Starter Monthly"
     * @example "Pro Annual"
     */
    name: z
      .string()
      .nonempty()
      .describe(
        'Display name for the pricing plan (eg, "Free", "Starter Monthly", "Pro Annual", etc)'
      )
      .openapi('name', { example: 'Starter Monthly' }),

    /**
     * A unique slug for the pricing plan which acts as a stable identifier
     * across deployments.
     *
     * Should be lower-kebab-cased.
     * Should be stable across deployments.
     *
     * For all plans aside from `free`, the `slug` should include the `interval`
     * as a suffix so pricing plans can be uniquely differentiated from each
     * other across billing intervals.
     *
     * @required
     * @example "free"
     * @example "starter-monthly"
     * @example "pro-annual"
     */
    slug: z
      .string()
      .nonempty()
      .describe(
        'PricingPlan slug (eg, "free", "starter-monthly", "pro-annual", etc). Should be lower-cased and kebab-cased. Should be stable across deployments.'
      )
      // TODO: Make `slug` optional and derive it from `name` if not provided.
      .openapi('slug', { example: 'starter-monthly' }),

    /**
     * The frequency at which this subscription is billed.
     */
    interval: pricingIntervalSchema.optional(),

    /**
     * Optional description of the pricing plan (UI-only).
     */
    description: z.string().optional(),

    /**
     * Optional list of features of the pricing plan (UI-only).
     */
    features: z.array(z.string()).optional(),

    /**
     * Optional number of days for a free trial period when a customer signs up
     * for a new subscription.
     */
    trialPeriodDays: z.number().nonnegative().optional(),

    /**
     * Optional rate limit to enforce for this pricing plan.
     *
     * You can use this to limit the number of API requests that can be made by
     * a customer during a given interval.
     *
     * If not set, the pricing plan will inherit the default platform rate-limit
     * set by `defaultRateLimit` in the Agentic project config.
     *
     * You can disable rate-limiting for this pricing plan by setting
     * `rateLimit.enabled` to `false`.
     *
     * Note that tool-specific rate limits may override pricing-plan-specific
     * rate-limits via `toolConfigs` in the Agentic project config.
     */
    rateLimit: rateLimitSchema.optional(),

    /**
     * List of LineItems which are included in the PricingPlan.
     *
     * Note: Agentic currently supports a max of 20 LineItems per pricing plan.
     */
    lineItems: z.array(pricingPlanLineItemSchema).nonempty().max(20, {
      message:
        'Agentic currently supports a max of 20 LineItems per pricing plan.'
    })
  })
  .describe(
    'Represents the config for a Stripe subscription with one or more PricingPlanLineItems.'
  )
  .openapi('PricingPlan')
// export type PricingPlan = z.infer<typeof pricingPlanSchema>

export type PricingPlanInput = Simplify<
  Omit<z.input<typeof pricingPlanSchema>, 'lineItems'> & {
    lineItems: [PricingPlanLineItemInput, ...PricingPlanLineItemInput[]]
  }
>

export type PricingPlan = Simplify<
  Omit<z.infer<typeof pricingPlanSchema>, 'lineItems'> & {
    lineItems: [PricingPlanLineItem, ...PricingPlanLineItem[]]
  }
>

/**
 * Map from PricingPlanLineItem **slug** to Stripe Product id
 */
export const stripeProductIdMapSchema = z
  .record(
    pricingPlanLineItemSlugSchema,
    z.string().describe('Stripe Product id')
  )
  .describe('Map from PricingPlanLineItem **slug** to Stripe Product id')
  .openapi('StripeProductIdMap')
export type StripeProductIdMap = z.infer<typeof stripeProductIdMapSchema>

/**
 * List of PricingPlans
 */
export const pricingPlanListSchema = z
  .array(pricingPlanSchema)
  .nonempty({
    message: 'Must contain at least one PricingPlan'
  })
  .describe('List of PricingPlans')
export type PricingPlanListInput = [PricingPlanInput, ...PricingPlanInput[]]
export type PricingPlanList = [PricingPlan, ...PricingPlan[]]

/**
 * Map from internal PricingPlanLineItem **slug** to Stripe Subscription Item id
 */
export const stripeSubscriptionItemIdMapSchema = z
  .record(
    pricingPlanLineItemSlugSchema,
    z.string().describe('Stripe Subscription Item id')
  )
  .describe(
    'Map from internal PricingPlanLineItem **slug** to Stripe Subscription Item id'
  )
  .openapi('StripeSubscriptionItemIdMap')
export type StripeSubscriptionItemIdMap = z.infer<
  typeof stripeSubscriptionItemIdMapSchema
>

// export const couponSchema = z
//   .object({
//     // used to uniquely identify this coupon across deployments
//     id: z.string(),

//     valid: z.boolean(),
//     stripeCoupon: z.string(),

//     name: z.string().optional(),

//     currency: z.string().optional(),
//     amount_off: z.number().optional(),
//     percent_off: z.number().optional(),

//     duration: z.string(),
//     duration_in_months: z.number().optional(),

//     redeem_by: z.date().optional(),
//     max_redemptions: z.number().optional()
//   })
//   .openapi('Coupon')
// export type Coupon = z.infer<typeof couponSchema>

/**
 * The default platform rate limit for `requests` is a limit of 1000 requests
 * per minute per customer.
 */
export const defaultRequestsRateLimit = {
  enabled: true,
  interval: 60,
  limit: 1000,
  mode: 'approximate'
} as const satisfies Readonly<RateLimit>

/**
 * The default free pricing plan which is used for projects that don't specify
 * custom pricing plans.
 */
export const defaultFreePricingPlan = {
  name: 'Free',
  slug: 'free',
  lineItems: [
    {
      slug: 'base',
      usageType: 'licensed',
      amount: 0
    }
  ],
  rateLimit: defaultRequestsRateLimit
} as const satisfies Readonly<PricingPlan>
