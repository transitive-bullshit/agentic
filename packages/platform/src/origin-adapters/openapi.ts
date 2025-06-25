import type {
  OpenAPIOriginAdapter,
  OpenAPIOriginAdapterConfig,
  Tool
} from '@agentic/platform-types'
import { assert, type Logger } from '@agentic/platform-core'
import {
  getToolsFromOpenAPISpec,
  validateOpenAPISpec
} from '@agentic/platform-openapi-utils'

export async function resolveOpenAPIOriginAdapter({
  origin,
  label,
  cwd,
  logger
}: {
  origin: OpenAPIOriginAdapterConfig
  label: string
  cwd?: string
  logger?: Logger
}): Promise<{
  origin: OpenAPIOriginAdapter
  tools?: Tool[]
}> {
  assert(
    origin.type === 'openapi',
    400,
    `Invalid origin adapter type "${origin.type}" for ${label}`
  )
  assert(
    origin.spec,
    400,
    `OpenAPI spec is required for ${label} with origin adapter type set to "openapi"`
  )

  // Validate and normalize the OpenAPI spec
  const openapiSpec = await validateOpenAPISpec(origin.spec, {
    cwd,
    logger
  })

  // Remove origin servers from the OpenAPI spec.
  // TODO: Ensure that `origin.url` matches any origin servers in the openapi spec?
  delete openapiSpec.servers

  // TODO: Additional, agentic-specific validation of the OpenAPI spec's
  // operations to ensure they are valid tools.

  // TODO: Simplify OpenAPI spec by removing any query params and headers
  // specific to the Agentic API gateway.

  // TODO: Extract tool definitions from OpenAPI operationIds

  const dereferencedOpenAPISpec = await validateOpenAPISpec(origin.spec, {
    cwd,
    dereference: true
  })

  const { tools, toolToOperationMap } = await getToolsFromOpenAPISpec(
    dereferencedOpenAPISpec
  )

  return {
    tools,
    origin: {
      ...origin,
      // Update the openapi spec with the normalized version
      spec: JSON.stringify(openapiSpec),
      toolToOperationMap
    }
  }
}
