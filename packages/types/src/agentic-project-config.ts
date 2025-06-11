import type { Simplify } from 'type-fest'
import { z } from '@hono/zod-openapi'

import {
  originAdapterConfigSchema,
  originAdapterSchema
} from './origin-adapter'
import {
  defaultFreePricingPlan,
  pricingIntervalListSchema,
  type PricingPlanList,
  type PricingPlanListInput,
  pricingPlanListSchema
} from './pricing'
import {
  type ToolConfig,
  type ToolConfigInput,
  toolConfigSchema,
  toolSchema
} from './tools'

// TODO:
// - optional external auth provider config (google, github, twitter, etc)
// - optional stripe webhooks
// - optional response header config (custom headers, immutability for caching, etc)
// - optional agentic version
// - optional version

export const agenticProjectConfigSchema = z
  .object({
    /**
     * Required name of the project.
     *
     * Must be lower kebab-case with no spaces and between 2 and 64 characters.
     *
     * @example "my-project"
     * @example "linkedin-resolver-23"
     */
    name: z.string().nonempty().describe('Name of the project.'),

    /**
     * Optional semantic version of the project as a semver string.
     */
    version: z
      .string()
      .nonempty()
      .describe(
        'Optional semantic version of the project as a semver string. Ex: 1.0.0, 0.0.1, 5.0.1, etc.'
      )
      .optional(),

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
      .describe(
        'Optional URL to the source code of the project (eg, GitHub repo).'
      )
      .optional(),

    /** Required origin API HTTPS base URL */
    originUrl: z.string().url()
      .describe(`Required base URL of the externally hosted origin API server. Must be a valid \`https\` URL.

NOTE: Agentic currently only supports \`external\` API servers. If you'd like to host your API or MCP server on Agentic's infrastructure, please reach out to support@agentic.so.`),

    /**
     * Optional origin API adapter used to configure the origin API server
     * downstream from Agentic's API gateway. It specifies whether the origin
     * API server denoted by \`originUrl\` is hosted externally or deployed
     * internally to Agentic's infrastructure. It also specifies the format
     * for how origin tools / services are defined: either as an OpenAPI spec,
     * an MCP server, or as a raw HTTP REST API.
     */
    originAdapter: originAdapterConfigSchema.optional().default({
      location: 'external',
      type: 'raw'
    }),

    /** Optional subscription pricing config for this project. */
    pricingPlans: pricingPlanListSchema
      .describe(
        'List of PricingPlans configuring which Stripe subscriptions should be available for the project. Defaults to a single free plan which is useful for developing and testing your project.'
      )
      .optional()
      .default([defaultFreePricingPlan]),

    /**
     * Optional list of billing intervals to enable in pricing plans.
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
      .default(['month']),

    /**
     * Optional list of tool configs to customize the behavior of tools.
     *
     * Make sure the tool `name` matches the origin server's tool names, either
     * via its MCP server or OpenAPI operationIds.
     *
     * Tool names are expected to be unique and stable across deployments.
     *
     * With `toolConfigs`, tools can be disabled, set custom rate-limits,
     * customize reporting usage for metered billing, and they can also
     * override behavior for different pricing plans.
     *
     * For example, you may want to disable certain tools on a `free` pricing
     * plan or remove the rate-limit for a specific tool on a `pro` pricing
     * plan while keeping the defualt rate-limit in place for other tools.
     *
     * Note that tool-specific configs override the defaults defined in
     * pricing plans.
     *
     * If a tool is defined on the origin server but not specified in
     * `toolConfigs`, it will use the default behavior of the Agentic API
     * gateway.
     */
    toolConfigs: z.array(toolConfigSchema).optional().default([])
  })
  .strip()

export type AgenticProjectConfigInput = Simplify<
  Omit<
    z.input<typeof agenticProjectConfigSchema>,
    'pricingPlans' | 'toolConfigs'
  > & {
    pricingPlans?: PricingPlanListInput
    toolConfigs?: ToolConfigInput[]
  }
>
export type AgenticProjectConfigRaw = z.output<
  typeof agenticProjectConfigSchema
>
export type AgenticProjectConfig = Simplify<
  Omit<AgenticProjectConfigRaw, 'pricingPlans' | 'toolConfigs'> & {
    pricingPlans: PricingPlanList
    toolConfigs: ToolConfig[]
  }
>

export const resolvedAgenticProjectConfigSchema =
  agenticProjectConfigSchema.extend({
    originAdapter: originAdapterSchema,
    tools: z.array(toolSchema).default([])
  })
export type ResolvedAgenticProjectConfig = Simplify<
  Omit<
    z.output<typeof resolvedAgenticProjectConfigSchema>,
    'pricingPlans' | 'toolConfigs'
  > & {
    pricingPlans: PricingPlanList
    toolConfigs: ToolConfig[]
  }
>
