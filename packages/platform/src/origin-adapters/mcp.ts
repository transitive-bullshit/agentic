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
  originUrl,
  originAdapter,
  label
}: {
  name: string
  originUrl: string
  originAdapter: MCPOriginAdapterConfig
  label: string
  version: string
}): Promise<{
  originAdapter: MCPOriginAdapter
  tools?: Tool[]
}> {
  assert(
    originAdapter.type === 'mcp',
    400,
    `Invalid origin adapter type "${originAdapter.type}" for ${label}`
  )
  const transport = new StreamableHTTPClientTransport(new URL(originUrl))
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
    originAdapter: {
      ...originAdapter,
      serverInfo
    }
  }
}
