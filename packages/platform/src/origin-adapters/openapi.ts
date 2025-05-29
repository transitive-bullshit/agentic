import type {
  OpenAPIOriginAdapter,
  OpenAPIOriginAdapterConfig,
  Tool
} from '@agentic/platform-schemas'
import { assert, type Logger } from '@agentic/platform-core'
import {
  getToolsFromOpenAPISpec,
  validateOpenAPISpec
} from '@agentic/platform-openapi'

export async function resolveOpenAPIOriginAdapter({
  originAdapter,
  label,
  cwd,
  logger
}: {
  originAdapter: OpenAPIOriginAdapterConfig
  label: string
  cwd?: URL
  logger?: Logger
}): Promise<{
  originAdapter: OpenAPIOriginAdapter
  tools?: Tool[]
}> {
  assert(
    originAdapter.type === 'openapi',
    400,
    `Invalid origin adapter type "${originAdapter.type}" for ${label}`
  )
  assert(
    originAdapter.spec,
    400,
    `OpenAPI spec is required for ${label} with origin adapter type set to "openapi"`
  )

  // Validate and normalize the OpenAPI spec
  const openapiSpec = await validateOpenAPISpec(originAdapter.spec, {
    cwd,
    logger
  })

  // Remove origin servers from the OpenAPI spec.
  // TODO: Ensure that `originUrl` matches any origin servers in the openapi spec?
  delete openapiSpec.servers

  // TODO: Additional, agentic-specific validation of the OpenAPI spec's
  // operations to ensure they are valid tools.

  // TODO: Simplify OpenAPI spec by removing any query params and headers
  // specific to the Agentic API gateway.

  // TODO: Extract tool definitions from OpenAPI operationIds

  const dereferencedOpenAPISpec = await validateOpenAPISpec(
    originAdapter.spec,
    {
      cwd,
      dereference: true
    }
  )

  const { tools, toolToOperationMap } = await getToolsFromOpenAPISpec(
    dereferencedOpenAPISpec
  )

  return {
    tools,
    originAdapter: {
      ...originAdapter,
      // Update the openapi spec with the normalized version
      spec: JSON.stringify(openapiSpec),
      toolToOperationMap
    }
  }
}
