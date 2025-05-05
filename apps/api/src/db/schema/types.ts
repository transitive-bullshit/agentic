import { z } from '@hono/zod-openapi'

export const authProviderTypeSchema = z
  .enum(['github', 'google', 'spotify', 'twitter', 'linkedin', 'stripe'])
  .openapi('AuthProviderType')
export type AuthProviderType = z.infer<typeof authProviderTypeSchema>

export const authProviderSchema = z
  .object({
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
  .openapi('AuthProvider')
export type AuthProvider = z.infer<typeof authProviderSchema>

export const authProvidersSchema = z
  .record(authProviderTypeSchema, authProviderSchema.optional())
  .openapi('AuthProviders')
export type AuthProviders = z.infer<typeof authProvidersSchema>

export const webhookSchema = z
  .object({
    url: z.string(),
    events: z.array(z.string())
  })
  .openapi('Webhook')
export type Webhook = z.infer<typeof webhookSchema>

export const rateLimitSchema = z
  .object({
    enabled: z.boolean(),

    // informal description that overrides any other properties
    desc: z.string().optional(),

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

export const pricingPlanMetricSchema = z
  .object({
    // slug acts as a primary key for metrics
    slug: z.string(),

    amount: z.number(),

    label: z.string(),
    unitLabel: z.string(),

    // TODO: should this default be 'licensed' or 'metered'?
    // methinks licensed for "sites", "jobs", etc...
    // TODO: this should probably be explicit since its easy to confuse
    usageType: z.enum(['licensed', 'metered']),

    billingScheme: z.enum(['per_unit', 'tiered']),

    tiersMode: z.enum(['graduated', 'volume']),
    tiers: z.array(pricingPlanTierSchema),

    // TODO (low priority): add aggregateUsage

    rateLimit: rateLimitSchema.optional()
  })
  .openapi('PricingPlanMetric')
export type PricingPlanMetric = z.infer<typeof pricingPlanMetricSchema>

export const pricingPlanSchema = z
  .object({
    name: z.string(),
    slug: z.string(),

    desc: z.string().optional(),
    features: z.array(z.string()),

    auth: z.boolean(),
    amount: z.number(),
    trialPeriodDays: z.number().optional(),

    requests: pricingPlanMetricSchema,
    metrics: z.array(pricingPlanMetricSchema),

    rateLimit: rateLimitSchema.optional(),

    // used to uniquely identify this pricing plan across deployments
    baseId: z.string(),

    // used to uniquely identify this pricing plan across deployments
    requestsId: z.string(),

    // [metricSlug: string]: string
    metricIds: z.record(z.string()),

    // NOTE: the stripe billing plan id(s) for this PricingPlan are referenced
    // in the Project._stripePlans mapping via the plan's hash.
    // NOTE: all metered billing usage is stored in stripe
    stripeBasePlanId: z.string(),
    stripeRequestPlanId: z.string(),

    // Record mapping metric slugs to stripe plan IDs
    // [metricSlug: string]: string
    stripeMetricPlans: z.record(z.string())
  })
  .openapi('PricingPlan')
export type PricingPlan = z.infer<typeof pricingPlanSchema>

export const couponSchema = z
  .object({
    // used to uniquely identify this coupon across deployments
    id: z.string(),

    valid: z.boolean(),
    stripeCoupon: z.string(),

    name: z.string().optional(),

    currency: z.string().optional(),
    amount_off: z.number().optional(),
    percent_off: z.number().optional(),

    duration: z.string(),
    duration_in_months: z.number().optional(),

    redeem_by: z.date().optional(),
    max_redemptions: z.number().optional()
  })
  .openapi('Coupon')
export type Coupon = z.infer<typeof couponSchema>
