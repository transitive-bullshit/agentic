import type { Simplify } from 'type-fest'
import { isValidProjectSlug } from '@agentic/platform-validators'
import { z } from '@hono/zod-openapi'

import {
  originAdapterConfigSchema,
  originAdapterSchema
} from './origin-adapter'
import {
  defaultFreePricingPlan,
  defaultRequestsRateLimit,
  pricingIntervalListSchema,
  type PricingPlanList,
  type PricingPlanListInput,
  pricingPlanListSchema
} from './pricing'
import {
  type RateLimit,
  type RateLimitInput,
  rateLimitSchema
} from './rate-limit'
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
     * Display name for the project.
     *
     * Max length 1024 characters.
     *
     * @required
     * @example "My Project"
     * @example "LinkedIn Resolver"
     */
    name: z
      .string()
      .max(1024)
      .nonempty()
      .describe('Display name for the project. Max length 1024 characters.'),

    /**
     * Slug for the project.
     *
     * Must be ascii-only, lower-case, and kebab-case with no spaces between 1
     * and 256 characters.
     *
     * The project's fully qualified identifier will be `@namespace/slug`, where
     * the `namespace` is determined by the author's `username` or team slug.
     *
     * If not provided, the project `slug` will be derived by slugifying `name`.
     *
     * @example "my-project"
     * @example "linkedin-resolver-23"
     */
    slug: z
      .string()
      .nonempty()
      .describe(
        'Unique project slug. Must be ascii-only, lower-case, and kebab-case with no spaces between 1 and 256 characters. If not provided, it will be derived by slugifying `name`.'
      )
      .optional()
      .refine((slug) => (slug ? isValidProjectSlug(slug) : true), {
        message: 'Invalid project slug'
      }),

    /**
     * Optional semantic version of the project as a semver string.
     *
     * @example "1.0.0"
     */
    version: z
      .string()
      .nonempty()
      .describe(
        'Optional semantic version of the project as a semver string. Ex: 1.0.0, 0.0.1, 5.0.1, etc.'
      )
      .optional(),

    /**
     * Optional short description of the project.
     *
     * Should be no longer than a few lines.
     */
    description: z
      .string()
      .describe('A short description of the project.')
      .optional(),

    /**
     * Optional embedded markdown readme documenting the project (supports GitHub-flavored markdown).
     */
    readme: z
      .string()
      .describe(
        'A readme documenting the project (supports GitHub-flavored markdown).'
      )
      .optional(),

    /**
     * Optional logo image URL to use for the project. Logos should have a
     * square aspect ratio.
     *
     * @example "https://example.com/logo.png"
     */
    iconUrl: z
      .string()
      .url()
      .optional()
      .describe(
        'Optional logo image URL to use for the project. Logos should have a square aspect ratio.'
      ),

    /**
     * Optional URL to the source code of the project (eg, GitHub repo).
     *
     * @example "https://github.com/my-org/my-project"
     */
    sourceUrl: z
      .string()
      .url()
      .describe(
        'Optional URL to the source code of the project (eg, GitHub repo).'
      )
      .optional(),

    /**
     * Origin API adapter used to configure the origin API server downstream
     * from Agentic's API gateway. It specifies whether the origin API server's
     * is hosted externally or deployed internally to Agentic's infrastructure.
     * If hosted externally, the origin `url` must be a valid \`https\` URL
     * pointing to the remote origin server.
     *
     * It also specifies the format for how origin tools are defined: either as
     * an OpenAPI spec or an MCP server.
     *
     * @note Currently, only external origin servers are supported. If you'd like
     * to host your API or MCP server on Agentic's infrastructure, please reach
     * out to support@agentic.so.
     *
     * @required
     */
    origin: originAdapterConfigSchema,

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
     * Optional default rate limits to enforce for all pricing plans.
     *
     * To disable the default rate-limit, set `defaultRateLimit.enabled` to
     * `false`.
     *
     * Note that pricing-plan-specific rate-limits override this default (via
     * `pricingPlans`), and tool-specific rate-limits may override both default
     * and pricing-plan-specific rate-limits (via `toolConfigs`).
     */
    defaultRateLimit: rateLimitSchema
      .optional()
      .default(defaultRequestsRateLimit),

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
    defaultRateLimit?: RateLimitInput
  }
>
export type AgenticProjectConfigRaw = z.output<
  typeof agenticProjectConfigSchema
>
export type AgenticProjectConfig = Simplify<
  Omit<AgenticProjectConfigRaw, 'pricingPlans' | 'toolConfigs'> & {
    slug: string
    pricingPlans: PricingPlanList
    toolConfigs: ToolConfig[]
    defaultRateLimit: RateLimit
  }
>

export const resolvedAgenticProjectConfigSchema = agenticProjectConfigSchema
  .required({
    slug: true
  })
  .extend({
    origin: originAdapterSchema,
    tools: z.array(toolSchema).default([])
  })
export type ResolvedAgenticProjectConfig = Simplify<
  Omit<
    z.output<typeof resolvedAgenticProjectConfigSchema>,
    'pricingPlans' | 'toolConfigs'
  > & {
    slug: string
    pricingPlans: PricingPlanList
    toolConfigs: ToolConfig[]
    defaultRateLimit: RateLimit
  }
>
