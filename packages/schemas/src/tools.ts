import { z } from '@hono/zod-openapi'

import { pricingPlanSlugSchema } from './pricing'
import { rateLimitSchema } from './rate-limit'

export const toolNameSchema = z
  .string()
  // TODO: validate this regex constraint
  .regex(/^[a-zA-Z0-9_]+$/)
  .nonempty()

export const jsonSchemaObjectSchema = z
  .object({
    type: z.literal('object'),
    properties: z.object({}).passthrough().optional(),
    required: z.array(z.string()).optional()
  })
  .passthrough()
  .openapi('JsonSchemaObject')

/**
 * Customizes a tool's behavior for a given pricing plan.
 */
export const pricingPlanToolConfigSchema = z
  .object({
    /**
     * Whether this tool should be enabled for customers on a given pricing plan.
     *
     * @default true
     */
    enabled: z.boolean().default(true).optional(),

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
     * Set to `null` to disable the default request-based rate-limiting for
     * this tool on a given pricing plan.
     *
     * @default undefined
     */
    rateLimit: z.union([rateLimitSchema, z.null()]).optional()
  })
  .openapi('PricingPlanToolConfig')
export type PricingPlanToolConfig = z.infer<typeof pricingPlanToolConfigSchema>

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
    enabled: z.boolean().default(true).optional(),

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
    immutable: z.boolean().default(false).optional(),

    /**
     * Whether calls to this tool should be reported as usage for the default
     * `requests` line-item's metered billing.
     *
     * Note: This is only relevant if the customer's active pricing plan
     * includes a `requests` line-item.
     *
     * @default true
     */
    reportUsage: z.boolean().default(true).optional(),

    /**
     * Customize the default `requests`-based rate-limiting for this tool.
     *
     * Set to `null` to disable the built-in rate-limiting.
     *
     * If not set, the default rate-limiting for the active pricing plan will be
     * used.
     *
     * @default undefined
     */
    rateLimit: z.union([rateLimitSchema, z.null()]).optional(),

    /**
     * Allows you to customize this tool's behavior or disable it entirely for
     * different pricing plans.
     *
     * This is a map from PricingPlan slug to PricingPlanToolConfig.
     *
     * @example
     * {
     *   "free": {
     *     "disabled": true
     *   }
     * }
     */
    pricingPlanConfig: z
      .record(pricingPlanSlugSchema, pricingPlanToolConfigSchema)
      .optional()
      .describe(
        'Map of PricingPlan slug to tool config overrides for a given plan. This is useful to customize tool behavior or disable tools completely on different pricing plans.'
      )

    // TODO?
    // examples
    // headers
  })
  .openapi('ToolConfig')
export type ToolConfig = z.infer<typeof toolConfigSchema>

/**
 * Additional properties describing a Tool to clients.
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

// export const toolMapSchema = z.record(toolNameSchema, toolSchema)
// export type ToolMap = z.infer<typeof toolMapSchema>
