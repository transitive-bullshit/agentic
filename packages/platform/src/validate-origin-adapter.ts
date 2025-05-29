import type {
  OriginAdapter,
  OriginAdapterConfig,
  Tool
} from '@agentic/platform-schemas'
import { assert, type Logger } from '@agentic/platform-core'
import {
  getToolsFromOpenAPISpec,
  validateOpenAPISpec
} from '@agentic/platform-openapi'
import { Client as McpClient } from '@modelcontextprotocol/sdk/client/index.js'

/**
 * Validates and normalizes the origin adapter config for a project.
 */
export async function validateOriginAdapter({
  name,
  version = '0.0.0',
  originUrl,
  originAdapter,
  label,
  cwd,
  logger
}: {
  name: string
  originUrl: string
  originAdapter: OriginAdapterConfig
  label: string
  version?: string
  cwd?: URL
  logger?: Logger
}): Promise<{
  originAdapter: OriginAdapter
  tools?: Tool[]
}> {
  assert(originUrl, 400, `Origin URL is required for ${label}`)

  if (originAdapter.type === 'openapi') {
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
  } else if (originAdapter.type === 'mcp') {
    // TODO: Validate MCP server info and tools

    const { SSEClientTransport } = await import(
      '@modelcontextprotocol/sdk/client/sse.js'
    )
    const transport = new SSEClientTransport(new URL(originUrl))
    const client = new McpClient({ name, version })
    await client.connect(transport)

    const serverInfo = {
      name,
      version,
      ...client.getServerVersion(),
      capabilities: client.getServerCapabilities(),
      instructions: client.getInstructions()
    }

    const listToolsResponse = await client.listTools()

    // TODO: Validate MCP tools
    const tools = listToolsResponse.tools

    return {
      originAdapter: {
        ...originAdapter,
        serverInfo
      },
      tools
    }
  } else {
    assert(
      originAdapter.type === 'raw',
      400,
      `Invalid origin adapter type "${originAdapter.type}" for ${label}`
    )

    return {
      originAdapter
    }
  }
}
