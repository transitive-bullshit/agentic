import { isToolNameAllowed, toolNameRe } from '@agentic/platform-validators'
import { z } from '@hono/zod-openapi'

import { pricingPlanSlugSchema } from './pricing'
import { rateLimitSchema } from './rate-limit'

/**
 * Agentic tool name.
 *
 * Follows OpenAI/Anthropic/Gemini function calling naming conventions.
 *
 * @example `"get_weather"`
 * @example `"searchGoogle"`
 * @example `"get_user_info2"`
 */
export const toolNameSchema = z
  .string()
  .nonempty()
  .regex(toolNameRe)
  .refine(
    (name) => isToolNameAllowed(name),
    (name) => ({
      message: `Tool name "${name}" is reserved; please choose a different name.`
    })
  )
  .describe('Agentic tool name')

/**
 * A zod schema representing any JSON Schema `object` schema.
 */
export const jsonSchemaObjectSchema = z
  .object({
    type: z.literal('object'),
    // TODO: improve this schema
    properties: z.record(z.string(), z.any()).optional(),
    required: z.array(z.string()).optional(),
    additionalProperties: z
      .union([z.boolean(), z.record(z.string(), z.any())])
      .optional()
  })
  .passthrough()
  .openapi('JsonSchemaObject')

/**
 * Overrides a tool's default behavior for a given pricing plan.
 *
 * You can use this, for instance, to disable tools on certain pricing plans
 * or to customize the rate-limits for specific tools on a given pricing plan.
 */
export const pricingPlanToolOverrideSchema = z
  .object({
    /**
     * Whether this tool should be enabled for customers on a given pricing plan.
     *
     * If `undefined`, will use the tool's default enabled state.
     *
     * @default undefined
     */
    enabled: z.boolean().optional(),

    /**
     * Overrides whether to report default `requests` usage for metered billing
     * for customers a given pricing plan.
     *
     * Note: This is only relevant if the pricing plan includes a `requests`
     * line-item.
     *
     * @default undefined
     */
    reportUsage: z.boolean().optional(),

    /**
     * Customize or disable rate limits for this tool for customers on a given
     * pricing plan.
     *
     * To disable rate-limiting for this tool on a given pricing plan, set
     * `rateLimit.enabled` to `false`.
     *
     * @default undefined
     */
    rateLimit: rateLimitSchema.optional()
  })
  .openapi('PricingPlanToolOverride')
export type PricingPlanToolOverride = z.infer<
  typeof pricingPlanToolOverrideSchema
>

/**
 * Example tool usage.
 */
export const toolConfigExampleSchema = z.object({
  /**
   * The display name of the example.
   */
  name: z.string().describe('The display name of the example.'),

  /**
   * The input prompt for agents to use when running this example.
   */
  prompt: z
    .string()
    .describe('The input prompt for agents to use when running this example.'),

  /**
   * An optional system prompt for agents to use when running this example.
   *
   * Defaults to `You are a helpful assistant. Be as concise as possible.`
   */
  systemPrompt: z
    .string()
    .optional()
    .describe(
      'An optional system prompt for agents to use when running this example. Defaults to `You are a helpful assistant. Be as concise as possible.`'
    ),

  /**
   * The arguments to pass to the tool for this example.
   */
  // TODO: validate example args against the tool's input schema during
  // config validation
  args: z
    .record(z.string(), z.any())
    .describe('The arguments to pass to the tool for this example.'),

  /**
   * Whether this example should be featured in the docs for the project.
   *
   * The first tool with a `featured` example will be the featured tool for the
   * project.
   */
  featured: z
    .boolean()
    .optional()
    .describe(
      'Whether this example should be featured in the docs for the project.'
    ),

  /**
   * A description of the example.
   */
  description: z.string().optional().describe('A description of the example.')
})

/**
 * Customizes a tool's default behavior across all pricing plans.
 */
export const toolConfigSchema = z
  .object({
    /**
     * The name of the tool, which acts as a unique, stable identifier for the
     * tool across deployments.
     */
    name: toolNameSchema,

    /**
     * Whether this tool should be enabled for all customers (default).
     *
     * If you want to hide a tool from customers but still have it present on
     * your origin server, set this to `false` for the given tool.
     *
     * @default true
     */
    enabled: z.boolean().optional(),

    /**
     * Whether this tool's output is deterministic and idempotent given the
     * same input.
     *
     * If `true`, tool outputs will be cached aggressively for identical
     * requests, though origin server response headers can still override this
     * behavior on a per-request basis.
     *
     * If `false`, tool outputs will be cached according to the origin server's
     * response headers on a per-request basis.
     *
     * @default false
     */
    pure: z.boolean().optional(),

    /**
     * A custom `Cache-Control` header to use for caching this tool's responses.
     *
     * If set, this field overrides `pure`.
     *
     * If not set and `pure` is `true`, the gateway will default to:
     * `public, max-age=31560000, s-maxage=31560000, stale-while-revalidate=3600`
     * (cache publicly for up to 1 year).
     *
     * If not set and `pure` is `false`, the gateway will default to `no-store`
     * which will disable caching. This is the default gateway behavior for
     * tools (no caching).
     *
     * Note that origin server response headers may also choose to disable
     * caching on a per-request basis.
     *
     * @default undefined
     */
    cacheControl: z.string().optional(),

    /**
     * Whether calls to this tool should be reported as usage for the default
     * `requests` line-item's metered billing.
     *
     * Note: This is only relevant if the customer's active pricing plan
     * includes a `requests` line-item.
     *
     * @default true
     */
    reportUsage: z.boolean().optional(),

    /**
     * Customize the default `requests`-based rate-limiting for this tool.
     *
     * To disable rate-limiting for this tool, set `rateLimit.enabled` to
     * `false`.
     *
     * If not set, the default rate-limiting for the active pricing plan will be
     * used.
     *
     * @default undefined
     */
    rateLimit: rateLimitSchema.optional(),

    /**
     * Whether to allow additional properties in the tool's input schema.
     *
     * The default MCP spec allows additional properties. Set this to `false` if
     * you want your tool to be more strict.
     *
     * @note This is only relevant if the tool has defined an `outputSchema`.
     *
     * @default undefined
     */
    inputSchemaAdditionalProperties: z.boolean().optional(),

    /**
     * Whether to allow additional properties in the tool's output schema.
     *
     * The default MCP spec allows additional properties. Set this to `false` if
     * you want your tool to be more strict.
     *
     * @note This is only relevant if the tool has defined an `outputSchema`.
     *
     * @default undefined
     */
    outputSchemaAdditionalProperties: z.boolean().optional(),

    /**
     * Allows you to override this tool's behavior or disable it entirely for
     * different pricing plans.
     *
     * This is a map from PricingPlan slug to PricingPlanToolOverride.
     *
     * @example
     * {
     *   "free": {
     *     "enabled": false
     *   }
     * }
     */
    pricingPlanOverridesMap: z
      .record(pricingPlanSlugSchema, pricingPlanToolOverrideSchema)
      .optional()
      .describe(
        "Allows you to override this tool's behavior or disable it entirely for different pricing plans. This is a map of PricingPlan slug to PricingPlanToolOverrides for that plan."
      ),

    // TODO?
    // headers

    examples: z
      .array(toolConfigExampleSchema)
      .optional()
      .describe(
        "Examples of how to use this tool. Used to generate example usage in the tool's docs."
      )
  })
  .openapi('ToolConfig')

export type ToolConfigInput = z.input<typeof toolConfigSchema>
export type ToolConfig = z.infer<typeof toolConfigSchema>

/**
 * Additional properties describing a Tool to clients.
 *
 * This matches MCP tool annotations 1:1.
 *
 * NOTE: All properties in ToolAnnotations are **hints**.
 *
 * They are not guaranteed to provide a faithful description of tool behavior
 * (including descriptive properties like `title`).
 *
 * Clients should never make tool use decisions based on ToolAnnotations
 * received from untrusted servers.
 */
export const toolAnnotationsSchema = z
  .object({
    /**
     * A human-readable title for the tool.
     */
    title: z.string().optional(),

    /**
     * If true, the tool does not modify its environment.
     *
     * Default: false
     */
    readOnlyHint: z.boolean().optional(),

    /**
     * If true, the tool may perform destructive updates to its environment.
     * If false, the tool performs only additive updates.
     *
     * (This property is meaningful only when `readOnlyHint == false`)
     *
     * Default: true
     */
    destructiveHint: z.boolean().optional(),

    /**
     * If true, calling the tool repeatedly with the same arguments
     * will have no additional effect on the its environment.
     *
     * (This property is meaningful only when `readOnlyHint == false`)
     *
     * Default: false
     */
    idempotentHint: z.boolean().optional(),

    /**
     * If true, this tool may interact with an "open world" of external
     * entities. If false, the tool's domain of interaction is closed.
     * For example, the world of a web search tool is open, whereas that
     * of a memory tool is not.
     *
     * Default: true
     */
    openWorldHint: z.boolean().optional()
  })
  .passthrough()

/**
 * Definition for an Agentic tool.
 *
 * This matches MCP tool scehemas 1:1.
 */
export const toolSchema = z
  .object({
    /**
     * The name of the tool, which acts as a unique, stable identifier for the
     * tool across deployments.
     *
     * @example `"get_weather"`
     * @example `"google_search"`
     */
    name: toolNameSchema,

    /**
     * A description of the tool intended to be used in prompts for LLMs to
     * understand when and how to use the tool.
     */
    description: z.string().optional(),

    /**
     * A JSON Schema object defining the expected parameters for the tool.
     */
    inputSchema: jsonSchemaObjectSchema,

    /**
     * An optional JSON Schema object defining the structure of the tool's
     * output.
     */
    outputSchema: jsonSchemaObjectSchema.optional(),

    /**
     * Optional additional tool information.
     *
     * Used by MCP servers.
     */
    annotations: toolAnnotationsSchema.optional()
  })
  .passthrough()
  .openapi('Tool')
export type Tool = z.infer<typeof toolSchema>
