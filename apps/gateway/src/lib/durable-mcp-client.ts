import { assert } from '@agentic/platform-core'
import { Client as McpClient } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { DurableObject } from 'cloudflare:workers'

import type { RawEnv } from './env'

export type DurableMcpClientInfo = {
  url: string
  name: string
  version: string
}

// TODO: not sure if there's a better way to handle re-using client connections
// across requests. Maybe we use one DurableObject per customer<>originUrl connection?

export class DurableMcpClient extends DurableObject<RawEnv> {
  protected client?: McpClient
  protected clientConnectionP?: Promise<void>

  async init(mcpClientInfo: DurableMcpClientInfo) {
    const durableMcpClientInfo =
      await this.ctx.storage.get<DurableMcpClientInfo>('mcp-client-info')

    if (!durableMcpClientInfo) {
      await this.ctx.storage.put('mcp-client-info', mcpClientInfo)
    } else {
      assert(
        mcpClientInfo.url === durableMcpClientInfo.url,
        500,
        `DurableMcpClientInfo url mismatch: "${mcpClientInfo.url}" vs "${durableMcpClientInfo.url}"`
      )
    }

    return this.ensureClientConnection(mcpClientInfo)
  }

  async isInitialized(): Promise<boolean> {
    return !!(await this.ctx.storage.get('mcp-client-info'))
  }

  async ensureClientConnection(durableMcpClientInfo?: DurableMcpClientInfo) {
    if (this.clientConnectionP) return this.clientConnectionP

    durableMcpClientInfo ??=
      await this.ctx.storage.get<DurableMcpClientInfo>('mcp-client-info')
    assert(
      durableMcpClientInfo,
      500,
      'DurableMcpClient has not been initialized'
    )
    const { name, version, url } = durableMcpClientInfo

    this.client = new McpClient({
      name,
      version
    })

    const transport = new StreamableHTTPClientTransport(new URL(url))
    this.clientConnectionP = this.client.connect(transport)
    await this.clientConnectionP
  }

  async callTool({
    name,
    args
  }: {
    name: string
    args: Record<string, unknown>
  }): Promise<string> {
    await this.ensureClientConnection()

    const toolCallResponse = await this.client!.callTool({
      name,
      arguments: args
    })

    // TODO: The `McpToolCallResponse` type is seemingly too complex for the CF
    // serialization type inference to handle, so bypass it by serializing to
    // a string and parsing it on the other end.
    return JSON.stringify(toolCallResponse)
  }
}
