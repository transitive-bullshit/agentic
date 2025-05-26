import { z } from '@hono/zod-openapi'

import {
  deploymentOriginAdapterSchema,
  pricingIntervalListSchema,
  type PricingPlan,
  pricingPlanListSchema
} from './schemas'

// TODO:
// - **service / tool definitions**
//   - optional per-service config (PricingPlanServiceConfigMap)
// - optional external auth provider config (google, github, twitter, etc)
// - origin adapter openapi schema path, url, or in-place definition
// - optional stripe webhooks
// - optional response header config (custom headers, immutability for caching, etc)
// - optional agentic version
// - optional version

export const defaultFreePricingPlan = {
  name: 'Free',
  slug: 'free',
  lineItems: [
    {
      slug: 'base',
      usageType: 'licensed',
      amount: 0
    }
  ]
} as const satisfies Readonly<PricingPlan>

export const agenticProjectConfigSchema = z.object({
  /**
   * Required name of the project.
   *
   * Must be lower kebab-case with no spaces and between 2 and 64 characters.
   *
   * @example "my-project"
   * @example "linkedin-resolver-23"
   */
  name: z.string().nonempty().describe('Name of the project.'),

  /** Optional short description of the project. */
  description: z
    .string()
    .describe('A short description of the project.')
    .optional(),

  /** Optional readme documenting the project (supports GitHub-flavored markdown). */
  readme: z
    .string()
    .describe(
      'A readme documenting the project (supports GitHub-flavored markdown).'
    )
    .optional(),

  /**
   * Optional logo image URL to use for the project. Logos should have a square aspect ratio.
   */
  iconUrl: z
    .string()
    .url()
    .optional()
    .describe(
      'Optional logo image URL to use for the project. Logos should have a square aspect ratio.'
    ),

  /** Optional URL to the source code of the project. */
  sourceUrl: z
    .string()
    .url()
    .optional()
    .describe(
      'Optional URL to the source code of the project (eg, GitHub repo).'
    ),

  /** Required origin API HTTPS base URL */
  originUrl: z.string().url()
    .describe(`Required base URL of the externally hosted origin API server. Must be a valid \`https\` URL.

NOTE: Agentic currently only supports \`external\` API servers. If you'd like to host your API or MCP server on Agentic's infrastructure, please reach out to support@agentic.so.`),

  /** Optional origin API config */
  originAdapter: deploymentOriginAdapterSchema.optional().default({
    location: 'external',
    type: 'raw'
  }),

  /** Optional subscription pricing config */
  pricingPlans: pricingPlanListSchema
    .describe(
      'List of PricingPlans configuring which Stripe subscriptions should be available for the project. Defaults to a single free plan which is useful for developing and testing.your project.'
    )
    .optional()
    .default([defaultFreePricingPlan]),

  /**
   * Optional list of billing intervals to enable in the pricingPlans.
   *
   * Defaults to a single monthly interval `['month']`.
   *
   * To add support for annual pricing plans, for example, you can use:
   * `['month', 'year']`.
   *
   * Note that for every pricing interval, you must define a corresponding set
   * of PricingPlans in the `pricingPlans` array. If you only have one pricing
   * interval (like the default `month` interval), `pricingPlans` don't need to
   * specify their `interval` property. Otherwise, all PricingPlans must
   * specify their `interval` property to differentiate between different
   * pricing intervals.
   */
  pricingIntervals: pricingIntervalListSchema
    .describe(
      `Optional list of billing intervals to enable in the pricingPlans.

Defaults to a single monthly interval \`['month']\`.

To add support for annual pricing plans, for example, you can use: \`['month', 'year']\`.`
    )
    .optional()
    .default(['month'])
})

export type AgenticProjectConfigInput = z.input<
  typeof agenticProjectConfigSchema
>
export type AgenticProjectConfig = z.output<typeof agenticProjectConfigSchema>
