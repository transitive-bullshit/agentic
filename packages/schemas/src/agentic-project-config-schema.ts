import { z } from '@hono/zod-openapi'

import {
  deploymentOriginAdapterSchema,
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
// - optional version
// - optional agentic version

export const freePricingPlan = {
  name: 'Free',
  slug: 'free',
  lineItems: [
    {
      slug: 'base',
      usageType: 'licensed',
      amount: 0
    }
  ]
} as const satisfies PricingPlan

export const agenticProjectConfigSchema = z.object({
  name: z.string().describe('Name of the project.'),

  // Metadata
  description: z
    .string()
    .describe('A one-sentence description of the project.')
    .optional(),
  readme: z
    .string()
    .describe(
      'A readme documenting the project (supports GitHub-flavored markdown).'
    )
    .optional(),
  sourceUrl: z
    .string()
    .url()
    .optional()
    .describe('Optional URL to the source code for the project.'),
  iconUrl: z
    .string()
    .url()
    .optional()
    .describe(
      'Optional logo image URL to use for the project. Logos should have a square aspect ratio.'
    ),

  // Required origin API config
  originUrl: z.string().url()
    .describe(`Required base URL of the externally hosted origin API server. Must be a valid \`https\` URL.

NOTE: Agentic currently only supports \`external\` API servers. If you'd like to host your API or MCP server on Agentic's infrastructure, please reach out to support@agentic.so.`),

  // Optional origin API config
  originAdapter: deploymentOriginAdapterSchema
    .default({
      location: 'external',
      type: 'raw'
    })
    .optional(),

  // Optional subscription pricing config
  pricingPlans: pricingPlanListSchema
    .describe(
      'List of PricingPlans configuring which Stripe subscriptions should be available for the project. Defaults to a single free plan which is useful for developing and testing.your project.'
    )
    .default([freePricingPlan])
    .optional()
})
export type AgenticProjectConfigInput = z.input<
  typeof agenticProjectConfigSchema
>
export type AgenticProjectConfigOutput = z.output<
  typeof agenticProjectConfigSchema
>
