import { z } from '@hono/zod-openapi'

import { mcpServerInfoSchema } from './mcp'
import { toolNameSchema } from './tools'

export const commonOriginAdapterSchema = z.object({
  /** Required URL of the remote origin server. Must be a valid \`https\` URL. */
  url: z.string().url()
    .describe(`Required URL of the externally hosted origin server. Must be a valid \`https\` URL.

NOTE: Agentic currently only supports \`external\` API servers. If you'd like to host your API or MCP server on Agentic's infrastructure, please reach out to support@agentic.so.`)
})

export const openapiOriginAdapterConfigSchema = commonOriginAdapterSchema.merge(
  z.object({
    /**
     * OpenAPI 3.x spec describing the origin API server.
     */
    type: z.literal('openapi'),

    /**
     * Local file path, URL, or JSON stringified OpenAPI spec describing the
     * origin API server.
     *
     * Must be a 3.x OpenAPI spec (older versions are not supported).
     */
    spec: z
      .string()
      .describe(
        'Local file path, URL, or JSON stringified OpenAPI spec describing the origin API server.'
      )
  })
)
export type OpenAPIOriginAdapterConfig = z.infer<
  typeof openapiOriginAdapterConfigSchema
>

export const mcpOriginAdapterConfigSchema = commonOriginAdapterSchema.merge(
  z.object({
    /**
     * MCP server.
     */
    type: z.literal('mcp'),

    // Optional headers to pass to the origin API server
    headers: z.record(z.string(), z.string()).optional()
  })
)
export type MCPOriginAdapterConfig = z.infer<
  typeof mcpOriginAdapterConfigSchema
>

// TODO: Decide on whether to support `raw` origin adapters or not. It's useful for
// internal testing.
export const rawOriginAdapterConfigSchema = commonOriginAdapterSchema.merge(
  z.object({
    /**
     * Marks the origin server as a raw HTTP REST API without any additional
     * tool or service definitions.
     *
     * In this mode, Agentic's API gateway acts as a simple reverse-proxy
     * to the origin server, without validating tools.
     */
    type: z.literal('raw')
  })
)
export type RawOriginAdapterConfig = z.infer<
  typeof rawOriginAdapterConfigSchema
>

/**
 * Origin adapter is used to configure the origin API server downstream from
 * Agentic's API gateway. It specifies whether the origin API server denoted
 * by `url` is hosted externally or deployed internally to Agentic's
 * infrastructure. It also specifies the format for how origin tools are
 * defined: either an OpenAPI spec or an MCP server.
 *
 * NOTE: Agentic currently only supports `external` API servers. If you'd like
 * to host your API or MCP server on Agentic's infrastructure, please reach out
 * to support@agentic.so.
 */
export const originAdapterConfigSchema = z
  .discriminatedUnion('type', [
    openapiOriginAdapterConfigSchema,

    mcpOriginAdapterConfigSchema,

    rawOriginAdapterConfigSchema
  ])
  .describe(
    `Origin adapter is used to configure the origin API server downstream from Agentic's API gateway. It specifies whether the origin API server denoted by \`url\` is hosted externally or deployed internally to Agentic's infrastructure. It also specifies the format for how origin tools are defined: either an OpenAPI spec or an MCP server.

NOTE: Agentic currently only supports \`external\` API servers. If you'd like to host your API or MCP server on Agentic's infrastructure, please reach out to support@agentic.so.`
  )
  .openapi('OriginAdapterConfig')
export type OriginAdapterConfig = z.infer<typeof originAdapterConfigSchema>

export const openapiOperationParameterSourceSchema = z.union([
  z.literal('query'),
  z.literal('header'),
  z.literal('path'),
  z.literal('cookie'),
  z.literal('body'),
  z.literal('formData')
])
export type OpenAPIOperationParameterSource = z.infer<
  typeof openapiOperationParameterSourceSchema
>

export const openapiOperationHttpMethodSchema = z.union([
  z.literal('get'),
  z.literal('put'),
  z.literal('post'),
  z.literal('delete'),
  z.literal('patch'),
  z.literal('trace')
])
export type OpenAPIOperationHttpMethod = z.infer<
  typeof openapiOperationHttpMethodSchema
>

export const openapiToolOperationSchema = z.object({
  operationId: z.string().describe('OpenAPI operationId for the tool'),
  method: openapiOperationHttpMethodSchema.describe('HTTP method'),
  path: z.string().describe('HTTP path template'),
  parameterSources: z
    .record(z.string(), openapiOperationParameterSourceSchema)
    .describe(
      'Mapping from parameter name to HTTP source (query, path, JSON body, etc).'
    ),
  tags: z.array(z.string()).optional()
})
export type OpenAPIToolOperation = z.infer<typeof openapiToolOperationSchema>

export const openapiOriginAdapterSchema = commonOriginAdapterSchema.merge(
  z.object({
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
      ),

    /**
     * Mapping from tool name to OpenAPI Operation info.
     *
     * This is used by the Agentic API gateway to route tools to the correct
     * origin API operation, along with the HTTP method, path, params, etc.
     *
     * @internal
     */
    toolToOperationMap: z
      .record(toolNameSchema, openapiToolOperationSchema)
      .describe(
        'Mapping from tool name to OpenAPI Operation info. This is used by the Agentic API gateway to route tools to the correct origin API operation, along with the HTTP method, path, params, etc.'
      )
  })
)
export type OpenAPIOriginAdapter = z.infer<typeof openapiOriginAdapterSchema>

export const mcpOriginAdapterSchema = commonOriginAdapterSchema.merge(
  z.object({
    /**
     * MCP server.
     */
    type: z.literal('mcp'),

    /**
     * Optional headers to pass to the origin API server.
     */
    headers: z.record(z.string(), z.string()).optional(),

    /**
     * MCP server info: name, version, capabilities, instructions, etc.
     */
    serverInfo: mcpServerInfoSchema
  })
)
export type MCPOriginAdapter = z.infer<typeof mcpOriginAdapterSchema>

export const rawOriginAdapterSchema = commonOriginAdapterSchema.merge(
  z.object({
    /**
     * Marks the origin server as a raw HTTP REST API without any additional
     * tool or service definitions.
     *
     * In this mode, Agentic's API gateway acts as a simple reverse-proxy
     * to the origin server, without validating tools.
     *
     * @note This mode is currently only for internal testing.
     */
    type: z.literal('raw')
  })
)
export type RawOriginAdapter = z.infer<typeof rawOriginAdapterSchema>

/**
 * Origin adapter is used to configure the origin API server downstream from
 * Agentic's API gateway. It specifies whether the origin API server denoted
 * by `url` is hosted externally or deployed internally to Agentic's
 * infrastructure.
 *
 * It also specifies the format for how origin tools are defined: either an
 * OpenAPI spec or an MCP server.
 *
 * @note Currently, only external origin servers are supported. If you'd like
 * to host your API or MCP server on Agentic's infrastructure, please reach
 * out to support@agentic.so.
 */
export const originAdapterSchema = z
  .discriminatedUnion('type', [
    openapiOriginAdapterSchema,

    mcpOriginAdapterSchema,

    rawOriginAdapterSchema
  ])
  .describe(
    `Origin adapter is used to configure the origin API server downstream from Agentic's API gateway. It specifies whether the origin API server denoted by \`url\` is hosted externally or deployed internally to Agentic's infrastructure. It also specifies the format for how origin tools are defined: either an OpenAPI spec, an MCP server, or a raw HTTP REST API.`
  )
  .openapi('OriginAdapter')
export type OriginAdapter = z.infer<typeof originAdapterSchema>
