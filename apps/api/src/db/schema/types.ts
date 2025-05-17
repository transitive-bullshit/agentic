import { z } from '@hono/zod-openapi'

import { assert } from '@/lib/utils'

export const authProviderTypeSchema = z
  .enum(['github', 'google', 'spotify', 'twitter', 'linkedin', 'stripe'])
  .openapi('AuthProviderType')
export type AuthProviderType = z.infer<typeof authProviderTypeSchema>

export const authProviderSchema = z.object({
  provider: authProviderTypeSchema,

  /** Provider-specific user id */
  id: z.string(),

  /** Provider-specific username */
  username: z.string().optional(),

  /** Standard oauth2 access token */
  accessToken: z.string().optional(),

  /** Standard oauth2 refresh token */
  refreshToken: z.string().optional(),

  /** Stripe public key */
  publicKey: z.string().optional(),

  /** OAuth scope(s) */
  scope: z.string().optional()
})
export type AuthProvider = z.infer<typeof authProviderSchema>

export const publicAuthProviderSchema = authProviderSchema
  .omit({
    accessToken: true,
    refreshToken: true,
    publicKey: true
  })
  .strip()
  .openapi('AuthProvider')
export type PublicAuthProvider = z.infer<typeof publicAuthProviderSchema>

export const authProvidersSchema = z.record(
  authProviderTypeSchema,
  authProviderSchema.optional()
)
export type AuthProviders = z.infer<typeof authProvidersSchema>

export const publicAuthProvidersSchema = z
  .record(authProviderTypeSchema, publicAuthProviderSchema.optional())
  .openapi('AuthProviders')
export type PublicAuthProviders = z.infer<typeof publicAuthProvidersSchema>

export const webhookSchema = z
  .object({
    url: z.string(),
    events: z.array(z.string())
  })
  .openapi('Webhook')
export type Webhook = z.infer<typeof webhookSchema>

export const rateLimitSchema = z
  .object({
    interval: z.number(), // seconds
    maxPerInterval: z.number() // unitless
  })
  .openapi('RateLimit')
export type RateLimit = z.infer<typeof rateLimitSchema>

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

export const pricingIntervalSchema = z
  .enum(['day', 'week', 'month', 'year'])
  .describe('The frequency at which a subscription is billed.')
  .openapi('PricingInterval')
export type PricingInterval = z.infer<typeof pricingIntervalSchema>

export const pricingPlanMetricHashSchema = z
  .string()
  .nonempty()
  .describe('Internal PricingPlanMetric hash')

export const pricingPlanMetricSlugSchema = z
  .string()
  .nonempty()
  .describe('PricingPlanMetric slug')

export const stripePriceIdMapSchema = z
  .record(pricingPlanMetricHashSchema, z.string().describe('Stripe Price id'))
  .describe('Map from internal PricingPlanMetric **hash** to Stripe Price id')
  .openapi('StripePriceIdMap')
export type StripePriceIdMap = z.infer<typeof stripePriceIdMapSchema>

export const stripeMeterIdMapSchema = z
  .record(pricingPlanMetricHashSchema, z.string().describe('Stripe Meter id'))
  .describe('Map from internal PricingPlanMetric **slug** to Stripe Meter id')
  .openapi('StripeMeterIdMap')
export type StripeMeterIdMap = z.infer<typeof stripeMeterIdMapSchema>

const commonPricingPlanMetricSchema = z.object({
  /**
   * Slugs act as the primary key for metrics. They should be lower and
   * kebab-cased ("base", "requests", "image-transformations").
   *
   * TODO: ensure user-provided custom metrics don't use reserved 'base'
   * and 'requests' slugs.
   */
  slug: z.union([z.string(), z.literal('base'), z.literal('requests')]),

  /**
   * The frequency at which a subscription is billed.
   *
   * Only optional when `PricingPlan.slug` is `free`.
   */
  interval: pricingIntervalSchema.optional(),

  label: z.string().optional().openapi('label', { example: 'API calls' })
})

/**
 * PricingPlanMetrics represent a single line-item in a Stripe Subscription.
 *
 * They map to a Stripe billing `Price` and possibly a corresponding Stripe
 * `Metric` for metered usage.
 */
export const pricingPlanMetricSchema = z
  .discriminatedUnion('usageType', [
    commonPricingPlanMetricSchema.merge(
      z.object({
        usageType: z.literal('licensed'),
        amount: z.number().nonnegative()
      })
    ),

    commonPricingPlanMetricSchema.merge(
      z.object({
        usageType: z.literal('metered'),
        unitLabel: z.string().optional(),

        /**
         * Optional rate limit to enforce for this metric.
         *
         * You can use this, for example, to limit the number of API calls that
         * can be made during a given interval.
         */
        rateLimit: rateLimitSchema.optional(),

        /**
         * Describes how to compute the price per period. Either `per_unit` or
         * `tiered`.
         *
         * `per_unit` indicates that the fixed amount (specified in
         * `unitAmount`) will be charged per unit of total usage.
         *
         * `tiered` indicates that the unit pricing will be computed using a
         * tiering strategy as defined using the `tiers` and `tiersMode`
         * attributes.
         */
        billingScheme: z.enum(['per_unit', 'tiered']),

        // Only applicable for `per_unit` billing schemes
        unitAmount: z.number().nonnegative().optional(),

        // Only applicable for `tiered` billing schemes
        tiersMode: z.enum(['graduated', 'volume']).optional(),
        tiers: z.array(pricingPlanTierSchema).optional(),

        // TODO: add support for tiered rate limits?

        /**
         * The default settings to aggregate the Stripe Meter's events with.
         *
         * Deafults to `{ formula: 'sum' }`.
         */
        defaultAggregation: z
          .object({
            /**
             * Specifies how events are aggregated for a Stripe Metric.
             * Allowed values are `count` to count the number of events, `sum`
             * to sum each event's value and `last` to take the last event's
             * value in the window.
             *
             * Defaults to `sum`.
             */
            formula: z.enum(['sum', 'count', 'last']).default('sum')
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
             */
            divideBy: z.number().positive(),

            /**
             * After division, either round the result `up` or `down`.
             */
            round: z.enum(['down', 'up'])
          })
          .optional()
      })
    )
  ])
  .refine((data) => {
    assert(
      !(data.slug === 'base' && data.usageType !== 'licensed'),
      `Invalid pricing plan metric "${data.slug}": "base" pricing plan metrics are reserved for "licensed" usage type.`
    )

    assert(
      !(data.slug === 'requests' && data.usageType !== 'metered'),
      `Invalid pricing plan metric "${data.slug}": "requests" pricing plan metrics are reserved for "metered" usage type.`
    )

    return data
  })
  .describe(
    'PricingPlanMetrics represent a single line-item in a Stripe Subscription. They map to a Stripe billing `Price` and possibly a corresponding Stripe `Metric` for metered usage.'
  )
  .openapi('PricingPlanMetric')
export type PricingPlanMetric = z.infer<typeof pricingPlanMetricSchema>

/**
 * Represents the config for a Stripe subscription with one or more
 * PricingPlanMetrics as line-items.
 */
export const pricingPlanSchema = z
  .object({
    name: z.string().nonempty().openapi('name', { example: 'Starter Monthly' }),
    slug: z.string().nonempty().openapi('slug', { example: 'starter-monthly' }),

    /**
     * The frequency at which a subscription is billed.
     */
    interval: pricingIntervalSchema.optional(),

    desc: z.string().optional(),
    features: z.array(z.string()),

    // TODO?
    trialPeriodDays: z.number().nonnegative().optional(),

    metricsMap: z
      .record(pricingPlanMetricSlugSchema, pricingPlanMetricSchema)
      .refine((metricsMap) => {
        // Stripe Checkout currently supports a max of 20 line items per
        // subscription.
        return Object.keys(metricsMap).length <= 20
      })
      .default({})
  })
  .refine((data) => {
    if (data.interval === undefined && data.slug !== 'free') {
      throw new Error(
        `Invalid PricingPlan "${data.slug}": non-free pricing plans must have an interval`
      )
    }

    return data
  })
  .describe(
    'Represents the config for a Stripe subscription with one or more PricingPlanMetrics as line-items.'
  )
  .openapi('PricingPlan')
export type PricingPlan = z.infer<typeof pricingPlanSchema>

export const stripeProductIdMapSchema = z
  .record(pricingPlanMetricSlugSchema, z.string().describe('Stripe Product id'))
  .describe('Map from PricingPlanMetric **slug** to Stripe Product id')
  .openapi('StripeProductIdMap')
export type StripeProductIdMap = z.infer<typeof stripeProductIdMapSchema>

export const pricingPlanMapSchema = z
  .record(z.string().describe('PricingPlan slug'), pricingPlanSchema)
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Must contain at least one PricingPlan'
  })
  .describe('Map from PricingPlan slug to PricingPlan')
export type PricingPlanMap = z.infer<typeof pricingPlanMapSchema>

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
