export type AuthProviderType =
  | 'github'
  | 'google'
  | 'spotify'
  | 'twitter'
  | 'linkedin'
  | 'stripe'

export type AuthProvider = {
  provider: AuthProviderType

  /** Provider-specific user id */
  id: string

  /** Provider-specific username */
  username?: string

  /** Standard oauth2 access token */
  accessToken?: string

  /** Standard oauth2 refresh token */
  refreshToken?: string

  /** Stripe public key */
  publicKey?: string

  /** OAuth scope(s) */
  scope?: string
}

export type AuthProviders = {
  github?: AuthProvider
  google?: AuthProvider
  spotify?: AuthProvider
  twitter?: AuthProvider
  linkedin?: AuthProvider
  stripeTest?: AuthProvider
  stripeLive?: AuthProvider
}

export type Webhook = {
  url: string
  events: string[]
}

export type RateLimit = {
  enabled: boolean

  // informal description that overrides any other properties
  desc?: string

  interval: number // seconds
  maxPerInterval: number // unitless
}

export type PricingPlanTier = {
  unitAmount?: number
  flatAmount?: number
  upTo: string
} & (
  | {
      unitAmount: number
    }
  | {
      flatAmount: number
    }
)

export type PricingPlanMetric = {
  // slug acts as a primary key for metrics
  slug: string

  amount: number

  label: string
  unitLabel: string

  // TODO: should this default be 'licensed' or 'metered'?
  // methinks licensed for "sites", "jobs", etc...
  // TODO: this should probably be explicit since its easy to confuse
  usageType: 'licensed' | 'metered'

  billingScheme: 'per_unit' | 'tiered'

  tiersMode: 'graduated' | 'volume'
  tiers: PricingPlanTier[]

  // TODO (low priority): add aggregateUsage

  rateLimit?: RateLimit
}

export type PricingPlan = {
  name: string
  slug: string

  desc?: string
  features: string[]

  auth: boolean
  amount: number
  trialPeriodDays?: number

  requests: PricingPlanMetric
  metrics: PricingPlanMetric[]

  rateLimit?: RateLimit

  // used to uniquely identify this plan across deployments
  baseId: string

  // used to uniquely identify this plan across deployments
  requestsId: string

  // [metricSlug: string]: string
  metricIds: Record<string, string>

  // NOTE: the stripe billing plan id(s) for this PricingPlan are referenced
  // in the Project._stripePlans mapping via the plan's hash.
  // NOTE: all metered billing usage is stored in stripe
  stripeBasePlan: string
  stripeRequestPlan: string

  // [metricSlug: string]: string
  stripeMetricPlans: Record<string, string>
}

export type Coupon = {
  // used to uniquely identify this coupon across deployments
  id: string

  valid: boolean
  stripeCoupon: string

  name?: string

  currency?: string
  amount_off?: number
  percent_off?: number

  duration: string
  duration_in_months?: number

  redeem_by?: Date
  max_redemptions?: number
}
