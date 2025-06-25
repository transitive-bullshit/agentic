import type { AgenticMcpRequestMetadata } from '@agentic/platform-types'
import { assert } from '@agentic/platform-core'
import { Client as McpClient } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import * as Sentry from '@sentry/cloudflare'
import { DurableObject } from 'cloudflare:workers'

import type { RawEnv } from './env'

export type DurableMcpClientInfo = {
  url: string
  name: string
  version: string
}

// TODO: not sure if there's a better way to handle re-using client connections
// across requests. Maybe we use one DurableObject per unique
// customer<>DurableMcpClientInfo connection?
// Currently using `sessionId`

export class DurableMcpClientBase extends DurableObject<RawEnv> {
  protected client?: McpClient
  protected clientConnectionP?: Promise<void>

  async init(mcpClientInfo: DurableMcpClientInfo) {
    const existingMcpClientInfo =
      await this.ctx.storage.get<DurableMcpClientInfo>('mcp-client-info')

    await this.ctx.storage.put('mcp-client-info', mcpClientInfo)
    if (existingMcpClientInfo) {
      if (mcpClientInfo.url !== existingMcpClientInfo.url) {
        // eslint-disable-next-line no-console
        console.warn(
          `DurableMcpClientInfo url changed from "${existingMcpClientInfo.url}" to "${mcpClientInfo.url}"`
        )
      }

      await this.client?.close()
      this.clientConnectionP = undefined
      this.client = undefined
    }

    return this.ensureClientConnection(mcpClientInfo)
  }

  async isInitialized(): Promise<boolean> {
    return !!(await this.ctx.storage.get('mcp-client-info'))
  }

  async ensureClientConnection(mcpClientInfo?: DurableMcpClientInfo) {
    if (this.clientConnectionP) return this.clientConnectionP

    mcpClientInfo ??=
      await this.ctx.storage.get<DurableMcpClientInfo>('mcp-client-info')
    assert(mcpClientInfo, 500, 'DurableMcpClient has not been initialized')
    const { name, version, url } = mcpClientInfo

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
    args,
    metadata
  }: {
    name: string
    args: Record<string, unknown>
    metadata: AgenticMcpRequestMetadata
  }): Promise<string> {
    await this.ensureClientConnection()

    const toolCallResponse = await this.client!.callTool({
      name,
      arguments: args,
      _meta: { agentic: metadata }
    })

    // TODO: The `McpToolCallResponse` type is seemingly too complex for the CF
    // serialization type inference to handle, so bypass it by serializing to
    // a string and parsing it on the other end.
    return JSON.stringify(toolCallResponse)
  }
}

export const DurableMcpClient = Sentry.instrumentDurableObjectWithSentry(
  (env: RawEnv) => ({
    dsn: env.SENTRY_DSN,
    environment: env.ENVIRONMENT,
    integrations: [Sentry.extraErrorDataIntegration()]
  }),
  DurableMcpClientBase
)
