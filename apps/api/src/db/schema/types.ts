import { z } from '@hono/zod-openapi'

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

export const pricingPlanLineItemHashSchema = z
  .string()
  .nonempty()
  .describe('Internal PricingPlanLineItem hash')

export const pricingPlanLineItemSlugSchema = z
  .string()
  .nonempty()
  .describe(
    'PricingPlanLineItem slug which acts as a unique lookup key for LineItems across deployments. They must be lower and kebab-cased ("base", "requests", "image-transformations").'
  )

export const pricingPlanSlugSchema = z
  .string()
  .nonempty()
  .describe(
    'PricingPlan slug which acts as a unique lookup key for PricingPlans across deployments. They must be lower and kebab-cased and should have the interval as a suffix ("free", "starter-monthly", "pro-annual").'
  )

export const stripePriceIdMapSchema = z
  .record(pricingPlanLineItemHashSchema, z.string().describe('Stripe Price id'))
  .describe('Map from internal PricingPlanLineItem **hash** to Stripe Price id')
  .openapi('StripePriceIdMap')
export type StripePriceIdMap = z.infer<typeof stripePriceIdMapSchema>

export const stripeMeterIdMapSchema = z
  .record(pricingPlanLineItemHashSchema, z.string().describe('Stripe Meter id'))
  .describe('Map from internal PricingPlanLineItem **slug** to Stripe Meter id')
  .openapi('StripeMeterIdMap')
export type StripeMeterIdMap = z.infer<typeof stripeMeterIdMapSchema>

const commonPricingPlanLineItemSchema = z.object({
  /**
   * Slugs act as the primary key for LineItems. They should be lower and
   * kebab-cased ("base", "requests", "image-transformations").
   *
   * TODO: ensure user-provided custom LineItems don't use reserved 'base'
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
 * PricingPlanLineItems represent a single line-item in a Stripe Subscription.
 *
 * They map to a Stripe billing `Price` and possibly a corresponding Stripe
 * `Meter` for metered usage.
 */
export const pricingPlanLineItemSchema = z
  .discriminatedUnion('usageType', [
    commonPricingPlanLineItemSchema.merge(
      z.object({
        usageType: z.literal('licensed'),
        amount: z.number().nonnegative()
      })
    ),

    commonPricingPlanLineItemSchema.merge(
      z.object({
        usageType: z.literal('metered'),
        unitLabel: z.string().optional(),

        /**
         * Optional rate limit to enforce for this metered LineItem.
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
             * Specifies how events are aggregated for a Stripe Meter.
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
  .refine(
    (data) => {
      if (data.slug === 'base') {
        return data.usageType === 'licensed'
      }

      return true
    },
    (data) => ({
      message: `Invalid PricingPlanLineItem "${data.slug}": reserved "base" line-items must have "licensed" usage type.`
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
      message: `Invalid PricingPlanLineItem "${data.slug}": reserved "requests" line-items must have "metered" usage type.`
    })
  )
  .describe(
    'PricingPlanLineItems represent a single line-item in a Stripe Subscription. They map to a Stripe billing `Price` and possibly a corresponding Stripe `Meter` for metered usage.'
  )
  .openapi('PricingPlanLineItem')
export type PricingPlanLineItem = z.infer<typeof pricingPlanLineItemSchema>

/**
 * Represents the config for a Stripe subscription with one or more
 * PricingPlanLineItems.
 */
export const pricingPlanSchema = z
  .object({
    name: z.string().nonempty().openapi('name', { example: 'Starter Monthly' }),
    slug: z
      .string()
      .nonempty()
      .describe(
        'PricingPlan slug ("free", "starter-monthly", "pro-annual", etc)'
      )
      .openapi('slug', { example: 'starter-monthly' }),

    /**
     * The frequency at which a subscription is billed.
     */
    interval: pricingIntervalSchema.optional(),

    desc: z.string().optional(),
    features: z.array(z.string()),

    // TODO?
    trialPeriodDays: z.number().nonnegative().optional(),

    lineItems: z.array(pricingPlanLineItemSchema).nonempty().max(20, {
      message:
        'Stripe Checkout currently supports a max of 20 line-items per subscription.'
    })
  })
  .refine(
    (data) => {
      if (data.interval === undefined) {
        return data.slug === 'free'
      }

      return true
    },
    (data) => ({
      message: `Invalid PricingPlan "${data.slug}": non-free pricing plans must have a valid interval`
    })
  )
  .refine(
    (data) => {
      if (data.slug === 'free') {
        return data.interval === undefined
      }

      return true
    },
    (data) => ({
      message: `Invalid PricingPlan "${data.slug}": free pricing plans must not have an interval`
    })
  )
  .refine(
    (data) => {
      const lineItemSlugs = new Set(
        data.lineItems.map((lineItem) => lineItem.slug)
      )

      return lineItemSlugs.size === data.lineItems.length
    },
    (data) => ({
      message: `Invalid PricingPlan "${data.slug}": duplicate line-item slugs`
    })
  )
  .describe(
    'Represents the config for a Stripe subscription with one or more PricingPlanLineItems.'
  )
  .openapi('PricingPlan')
export type PricingPlan = z.infer<typeof pricingPlanSchema>

export const stripeProductIdMapSchema = z
  .record(
    pricingPlanLineItemSlugSchema,
    z.string().describe('Stripe Product id')
  )
  .describe('Map from PricingPlanLineItem **slug** to Stripe Product id')
  .openapi('StripeProductIdMap')
export type StripeProductIdMap = z.infer<typeof stripeProductIdMapSchema>

export const pricingPlanListSchema = z
  .array(pricingPlanSchema)
  .nonempty({
    message: 'Must contain at least one PricingPlan'
  })
  .refine(
    (pricingPlans) => {
      const slugs = new Set(pricingPlans.map((p) => p.slug))
      return slugs.size === pricingPlans.length
    },
    {
      message: `Invalid PricingPlanList: duplicate PricingPlan slugs`
    }
  )
  .refine(
    (pricingPlans) => {
      const pricingPlanLineItemSlugMap: Record<string, PricingPlanLineItem[]> =
        {}
      for (const pricingPlan of pricingPlans) {
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

          if (lineItem.usageType !== lineItem0.usageType) {
            return false
          }
        }
      }

      return true
    },
    {
      message: `Invalid PricingPlanList: all pricing plans which contain the same LineItems (by slug) must have the same usage type (licensed or metered).`
    }
  )
  .describe('List of PricingPlans')
export type PricingPlanList = z.infer<typeof pricingPlanListSchema>

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
