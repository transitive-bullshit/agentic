import { z } from '@hono/zod-openapi'

import { mcpServerInfoSchema } from './mcp'
import { toolNameSchema } from './tools'

export const originAdapterLocationSchema = z.literal('external')
// z.union([
//   z.literal('external'),
//   z.literal('internal')
// ])
export type OriginAdapterLocation = z.infer<typeof originAdapterLocationSchema>

// export const originAdapterInternalTypeSchema = z.union([
//   z.literal('docker'),
//   z.literal('mcp'),
//   z.literal('python-fastapi'),
//   // etc
// ])
// export type OriginAdapterInternalType = z.infer<
//   typeof originAdapterInternalTypeSchema
// >

export const commonOriginAdapterSchema = z.object({
  location: originAdapterLocationSchema

  // TODO: Add support for `internal` hosted API servers
  // internalType: originAdapterInternalTypeSchema.optional()
})

// TODO: add future support for:
// - external mcp
// - internal docker
// - internal mcp
// - internal http
// - etc

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

export const mcpOriginAdapterConfigSchema = commonOriginAdapterSchema.merge(
  z.object({
    /**
     * MCP server.
     */
    type: z.literal('mcp')
  })
)

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

/**
 * Origin adapter is used to configure the origin API server downstream from
 * Agentic's API gateway. It specifies whether the origin API server denoted
 * by `originUrl` is hosted externally or deployed internally to Agentic's
 * infrastructure. It also specifies the format for how origin tools are
 * defined: either an OpenAPI spec, an MCP server, or as a raw HTTP REST API.
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
    `Origin adapter is used to configure the origin API server downstream from Agentic's API gateway. It specifies whether the origin API server denoted by \`originUrl\` is hosted externally or deployed internally to Agentic's infrastructure. It also specifies the format for how origin tools are defined: either an OpenAPI spec, an MCP server, or a raw HTTP REST API.

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

export const mcpOriginAdapterSchema = commonOriginAdapterSchema.merge(
  z.object({
    /**
     * MCP server.
     */
    type: z.literal('mcp'),

    /**
     * MCP server info: name, version, capabilities, instructions, etc.
     */
    serverInfo: mcpServerInfoSchema
  })
)

export const rawOriginAdapterSchema = commonOriginAdapterSchema.merge(
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

/**
 * Origin adapter is used to configure the origin API server downstream from
 * Agentic's API gateway. It specifies whether the origin API server denoted
 * by `originUrl` is hosted externally or deployed internally to Agentic's
 * infrastructure. It also specifies the format for how origin tools are
 * defined: either an OpenAPI spec, an MCP server, or as a raw HTTP REST API.
 */
export const originAdapterSchema = z
  .discriminatedUnion('type', [
    openapiOriginAdapterSchema,

    mcpOriginAdapterSchema,

    rawOriginAdapterSchema
  ])
  .describe(
    `Origin adapter is used to configure the origin API server downstream from Agentic's API gateway. It specifies whether the origin API server denoted by \`originUrl\` is hosted externally or deployed internally to Agentic's infrastructure. It also specifies the format for how origin tools are defined: either an OpenAPI spec, an MCP server, or a raw HTTP REST API.`
  )
  .openapi('OriginAdapter')
export type OriginAdapter = z.infer<typeof originAdapterSchema>
