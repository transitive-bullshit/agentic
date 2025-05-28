import { z } from '@hono/zod-openapi'

export const toolNameSchema = z
  .string()
  // TODO: validate this regex constraint
  .regex(/^[a-zA-Z0-9_]+$/)
  .nonempty()

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
     * The name of the tool.
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
    inputSchema: z
      .object({
        type: z.literal('object'),
        properties: z.object({}).passthrough().optional(),
        required: z.array(z.string()).optional()
      })
      .passthrough(),

    /**
     * An optional JSON Schema object defining the structure of the tool's
     * output.
     */
    outputSchema: z
      .object({
        type: z.literal('object'),
        properties: z.object({}).passthrough().optional(),
        required: z.array(z.string()).optional()
      })
      .passthrough()
      .optional(),

    /**
     * Optional additional tool information.
     */
    annotations: toolAnnotationsSchema.optional()
  })
  .passthrough()
  .openapi('Tool')
export type Tool = z.infer<typeof toolSchema>

export const toolMapSchema = z.record(toolNameSchema, toolSchema)
export type ToolMap = z.infer<typeof toolMapSchema>
