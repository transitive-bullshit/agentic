import { z } from '@hono/zod-openapi'

/**
 * Capabilities that a server may support.
 *
 * Known capabilities are defined here, in this schema, but this is not a
 * closed set: any server can define its own, additional capabilities.
 */
export const mcpServerCapabilitiesSchema = z
  .object({
    /**
     * Experimental, non-standard capabilities that the server supports.
     */
    experimental: z.optional(z.object({}).passthrough()),

    /**
     * Present if the server supports sending log messages to the client.
     */
    logging: z.optional(z.object({}).passthrough()),

    /**
     * Present if the server supports sending completions to the client.
     */
    completions: z.optional(z.object({}).passthrough()),

    /**
     * Present if the server offers any prompt templates.
     */
    prompts: z.optional(
      z
        .object({
          /**
           * Whether this server supports issuing notifications for changes to
           * the prompt list.
           */
          listChanged: z.optional(z.boolean())
        })
        .passthrough()
    ),

    /**
     * Present if the server offers any resources to read.
     */
    resources: z.optional(
      z
        .object({
          /**
           * Whether this server supports clients subscribing to resource updates.
           */
          subscribe: z.optional(z.boolean()),

          /**
           * Whether this server supports issuing notifications for changes to
           * the resource list.
           */
          listChanged: z.optional(z.boolean())
        })
        .passthrough()
    ),

    /**
     * Present if the server offers any tools to call.
     */
    tools: z.optional(
      z
        .object({
          /**
           * Whether this server supports issuing notifications for changes to
           * the tool list.
           */
          listChanged: z.optional(z.boolean())
        })
        .passthrough()
    )
  })
  .passthrough()

/**
 * After receiving an initialize request from the client, the server sends
 * this response.
 */
export const mcpServerInfoSchema = z.object({
  /**
   * The name of the MCP server.
   */
  name: z.string(),

  /**
   * The version of the MCP server.
   */
  version: z.string(),

  /**
   * The advertised capabilities of the MCP server.
   */
  capabilities: mcpServerCapabilitiesSchema.optional(),

  /**
   * Instructions describing how to use the server and its features.
   *
   * This can be used by clients to improve the LLM's understanding of
   * available tools, resources, etc. It can be thought of like a "hint" to the
   * model. For example, this information MAY be added to the system prompt.
   */
  instructions: z.string().optional()
})
