import { z } from '@hono/zod-openapi'

export const webhookSchema = z
  .object({
    url: z.string(),
    events: z.array(z.string())
  })
  .openapi('Webhook')
export type Webhook = z.infer<typeof webhookSchema>

/**
 * Rate limit config for metered LineItems.
 */
export const rateLimitSchema = z
  .object({
    interval: z.number(), // seconds
    maxPerInterval: z.number() // unitless
  })
  .openapi('RateLimit')
export type RateLimit = z.infer<typeof rateLimitSchema>

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

const commonPricingPlanLineItemSchema = z.object({
  /**
   * Slugs act as the primary key for LineItems. They should be lower and
   * kebab-cased ("base", "requests", "image-transformations").
   *
   * The `base` slug is reserved for a plan's default `licensed` line-item.
   *
   * The `requests` slug is reserved for charging using `metered billing based
   * on the number of request made during a given billing interval.
   *
   * All other PricingPlanLineItem `slugs` are considered custom LineItems.
   */
  slug: z.union([z.string(), z.literal('base'), z.literal('requests')]),

  /**
   * The frequency at which a subscription is billed.
   *
   * Only optional on free plans (when `PricingPlan.slug` is `free`), since
   * free plans don't depend on a billing interval.
   */
  interval: pricingIntervalSchema.optional(),

  /**
   * Optional label for the line-item which will be displayed on customer bills.
   *
   * If unset, the line-item's `slug` will be used as the label.
   */
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
    ),

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
         * Optional rate limit to enforce for this metered line-item.
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
         * In `volume`-based tiering, the maximum quantity within a period
         * determines the per unit price, in `graduated` tiering pricing can
         * successively change as the quantity grows.
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
            formula: z
              .union([z.literal('sum'), z.literal('count'), z.literal('last')])
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
  .describe(
    'PricingPlanLineItems represent a single line-item in a Stripe Subscription. They map to a Stripe billing `Price` and possibly a corresponding Stripe `Meter` for usage-based line-items.'
  )
  .openapi('PricingPlanLineItem')
export type PricingPlanLineItem = z.infer<typeof pricingPlanLineItemSchema>

/**
 * Represents the config for a single Stripe subscription plan with one or more
 * LineItems.
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

    /**
     * Optional description of the PricingPlan which is used for UI-only.
     */
    description: z.string().optional(),

    /**
     * Optional list of features of the PricingPlan which is used for UI-only.
     */
    features: z.array(z.string()).optional(),

    /**
     * Optional number of days for a free trial period when a customer signs up
     * for a new subscription.
     */
    trialPeriodDays: z.number().nonnegative().optional(),

    /**
     * List of LineItems which are included in the PricingPlan.
     *
     * Note: we currently support a max of 20 LineItems per plan.
     */
    lineItems: z.array(pricingPlanLineItemSchema).nonempty().max(20, {
      message:
        'Stripe Checkout currently supports a max of 20 LineItems per subscription.'
    })
  })
  .describe(
    'Represents the config for a Stripe subscription with one or more PricingPlanLineItems.'
  )
  .openapi('PricingPlan')
export type PricingPlan = z.infer<typeof pricingPlanSchema>

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
export type PricingPlanList = z.infer<typeof pricingPlanListSchema>

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

export const deploymentOriginAdapterLocationSchema = z.literal('external')
// z.union([
//   z.literal('external'),
//   z.literal('internal')
// ])
export type DeploymentOriginAdapterLocation = z.infer<
  typeof deploymentOriginAdapterLocationSchema
>

// export const deploymentOriginAdapterInternalTypeSchema = z.union([
//   z.literal('docker'),
//   z.literal('mcp'),
//   z.literal('python-fastapi'),
//   // etc
// ])
// export type DeploymentOriginAdapterInternalType = z.infer<
//   typeof deploymentOriginAdapterInternalTypeSchema
// >

export const commonDeploymentOriginAdapterSchema = z.object({
  location: deploymentOriginAdapterLocationSchema

  // TODO: Add support for `internal` hosted API servers
  // internalType: deploymentOriginAdapterInternalTypeSchema.optional()
})

// TODO: add future support for:
// - external mcp
// - internal docker
// - internal mcp
// - internal http
// - etc

/**
 * Deployment origin API adapter is used to configure the origin API server downstream from Agentic's API gateway. It specifies whether the origin API server denoted by `originUrl` is hosted externally or deployed internally to Agentic's infrastructure. It also specifies the format for how origin tools / services are defined: either as an OpenAPI spec, an MCP server, or as a raw HTTP REST API.

  NOTE: Agentic currently only supports `external` API servers. If you'd like to host your API or MCP server on Agentic's infrastructure, please reach out to support@agentic.so.
 */
export const deploymentOriginAdapterSchema = z
  .discriminatedUnion('type', [
    z
      .object({
        /**
         * OpenAPI 3.x spec describing the origin API server.
         */
        type: z.literal('openapi'),

        /**
         * JSON stringified OpenAPI spec describing the origin API server.
         *
         * The origin API servers are be hidden in the embedded OpenAPI spec,
         * because clients should only be aware of the upstream Agentic API
         * gateway.
         */
        spec: z
          .string()
          .describe(
            'JSON stringified OpenAPI spec describing the origin API server.'
          )
      })
      .merge(commonDeploymentOriginAdapterSchema),

    z
      .object({
        /**
         * Marks the origin server as a raw HTTP REST API without any additional
         * tool or service definitions.
         *
         * In this mode, Agentic's API gateway acts as a simple reverse-proxy
         * to the origin server, without validating tools or services.
         */
        type: z.literal('raw')
      })
      .merge(commonDeploymentOriginAdapterSchema)
  ])
  .describe(
    `Deployment origin API adapter is used to configure the origin API server downstream from Agentic's API gateway. It specifies whether the origin API server denoted by \`originUrl\` is hosted externally or deployed internally to Agentic's infrastructure. It also specifies the format for how origin tools / services are defined: either as an OpenAPI spec, an MCP server, or as a raw HTTP REST API.

NOTE: Agentic currently only supports \`external\` API servers. If you'd like to host your API or MCP server on Agentic's infrastructure, please reach out to support@agentic.so.`
  )
  .openapi('DeploymentOriginAdapter')
export type DeploymentOriginAdapter = z.infer<
  typeof deploymentOriginAdapterSchema
>
