import { z } from '@hono/zod-openapi'

export const deploymentOriginAdapterLocationSchema = z.literal('external')
// z.union([
//   z.literal('external'),
//   z.literal('internal')
// ])
export type DeploymentOriginAdapterLocation = z.infer<
  typeof deploymentOriginAdapterLocationSchema
>

// export const deploymentOriginAdapterInternalTypeSchema = z.union([
//   z.literal('docker'),
//   z.literal('mcp'),
//   z.literal('python-fastapi'),
//   // etc
// ])
// export type DeploymentOriginAdapterInternalType = z.infer<
//   typeof deploymentOriginAdapterInternalTypeSchema
// >

export const commonDeploymentOriginAdapterSchema = z.object({
  location: deploymentOriginAdapterLocationSchema

  // TODO: Add support for `internal` hosted API servers
  // internalType: deploymentOriginAdapterInternalTypeSchema.optional()
})

// TODO: add future support for:
// - external mcp
// - internal docker
// - internal mcp
// - internal http
// - etc

/**
 * Deployment origin API adapter is used to configure the origin API server downstream from Agentic's API gateway. It specifies whether the origin API server denoted by `originUrl` is hosted externally or deployed internally to Agentic's infrastructure. It also specifies the format for how origin tools / services are defined: either as an OpenAPI spec, an MCP server, or as a raw HTTP REST API.

  NOTE: Agentic currently only supports `external` API servers. If you'd like to host your API or MCP server on Agentic's infrastructure, please reach out to support@agentic.so.
 */
export const deploymentOriginAdapterSchema = z
  .discriminatedUnion('type', [
    z
      .object({
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
          )
      })
      .merge(commonDeploymentOriginAdapterSchema),

    z
      .object({
        /**
         * Marks the origin server as a raw HTTP REST API without any additional
         * tool or service definitions.
         *
         * In this mode, Agentic's API gateway acts as a simple reverse-proxy
         * to the origin server, without validating tools or services.
         */
        type: z.literal('raw')
      })
      .merge(commonDeploymentOriginAdapterSchema)
  ])
  .describe(
    `Deployment origin API adapter is used to configure the origin API server downstream from Agentic's API gateway. It specifies whether the origin API server denoted by \`originUrl\` is hosted externally or deployed internally to Agentic's infrastructure. It also specifies the format for how origin tools / services are defined: either as an OpenAPI spec, an MCP server, or as a raw HTTP REST API.

NOTE: Agentic currently only supports \`external\` API servers. If you'd like to host your API or MCP server on Agentic's infrastructure, please reach out to support@agentic.so.`
  )
  .openapi('DeploymentOriginAdapter')
export type DeploymentOriginAdapter = z.infer<
  typeof deploymentOriginAdapterSchema
>
