import type {
  MCPOriginAdapter,
  MCPOriginAdapterConfig,
  Tool
} from '@agentic/platform-types'
import { assert } from '@agentic/platform-core'
import { Client as McpClient } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

export async function resolveMCPOriginAdapter({
  name,
  version,
  origin,
  label
}: {
  name: string
  origin: MCPOriginAdapterConfig
  label: string
  version: string
}): Promise<{
  origin: MCPOriginAdapter
  tools?: Tool[]
}> {
  assert(
    origin.type === 'mcp',
    400,
    `Invalid origin adapter type "${origin.type}" for ${label}`
  )
  const transport = new StreamableHTTPClientTransport(new URL(origin.url))
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
    tools,
    origin: {
      ...origin,
      serverInfo
    }
  }
}
