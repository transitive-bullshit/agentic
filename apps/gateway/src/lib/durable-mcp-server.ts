import type { AdminDeployment, PricingPlan } from '@agentic/platform-types'
import type { JSONRPCRequest } from '@modelcontextprotocol/sdk/types.js'
// import type { JSONRPCRequest } from '@modelcontextprotocol/sdk/types.js'
import { assert } from '@agentic/platform-core'
import { parseDeploymentIdentifier } from '@agentic/platform-validators'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { DurableObject } from 'cloudflare:workers'

import type { AdminConsumer } from './types'

export type DurableMcpServerInfo = {
  deployment: AdminDeployment
  consumer?: AdminConsumer
  pricingPlan?: PricingPlan
}

export class DurableMcpServer extends DurableObject {
  protected server?: McpServer
  protected serverTransport?: StreamableHTTPServerTransport
  protected serverConnectionP?: Promise<void>

  async init(mcpServerInfo: DurableMcpServerInfo) {
    const existingMcpServerInfo =
      await this.ctx.storage.get<DurableMcpServerInfo>('mcp-server-info')

    if (!existingMcpServerInfo) {
      await this.ctx.storage.put('mcp-server-info', mcpServerInfo)
    } else {
      assert(
        mcpServerInfo.deployment.id === existingMcpServerInfo.deployment.id,
        500,
        `DurableMcpServerInfo deployment id mismatch: "${mcpServerInfo.deployment.id}" vs "${existingMcpServerInfo.deployment.id}"`
      )
    }

    return this.ensureServerConnection(mcpServerInfo)
  }

  async isInitialized(): Promise<boolean> {
    return !!(await this.ctx.storage.get('mcp-server-info'))
  }

  async ensureServerConnection(mcpServerInfo?: DurableMcpServerInfo) {
    if (this.serverConnectionP) return this.serverConnectionP

    mcpServerInfo ??=
      await this.ctx.storage.get<DurableMcpServerInfo>('mcp-server-info')
    assert(mcpServerInfo, 500, 'DurableMcpServer has not been initialized')
    const { deployment } = mcpServerInfo

    const { projectIdentifier } = parseDeploymentIdentifier(
      deployment.identifier
    )

    this.server = new McpServer({
      name: projectIdentifier,
      version: deployment.version ?? '0.0.0'
    })

    for (const tool of deployment.tools) {
      this.server.registerTool(
        tool.name,
        {
          description: tool.description,
          inputSchema: tool.inputSchema as any, // TODO: investigate types
          outputSchema: tool.outputSchema as any, // TODO: investigate types
          annotations: tool.annotations
        },
        (_args: Record<string, unknown>) => {
          assert(false, 500, `Tool call not implemented: ${tool.name}`)

          // TODO???
          return {
            content: [],
            _meta: {
              toolName: tool.name
            }
          }
        }
      )
    }

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => {
        // TODO: improve this
        return crypto.randomUUID()
      },
      onsessioninitialized: (sessionId) => {
        // TODO: improve this
        // eslint-disable-next-line no-console
        console.log(`Session initialized: ${sessionId}`)
      }
    })
    this.serverConnectionP = this.server.connect(transport)

    return this.serverConnectionP
  }

  // async fetch(request: Request) {
  //   await this.ensureServerConnection()
  //   const { readable, writable } = new TransformStream()
  //   const writer = writable.getWriter()
  //   const encoder = new TextEncoder()

  //   const response = new Response(readable, {
  //     headers: {
  //       'Content-Type': 'text/event-stream',
  //       'Cache-Control': 'no-cache',
  //       Connection: 'keep-alive'
  //       // 'mcp-session-id': sessionId
  //     }
  //   })

  //   await this.serverTransport!.handleRequest(request, response)
  // }

  async onRequest(message: JSONRPCRequest) {
    await this.ensureServerConnection()

    // We need to map every incoming message to the connection that it came in on
    // so that we can send relevant responses and notifications back on the same connection
    // if (isJSONRPCRequest(message)) {
    //   this._requestIdToConnectionId.set(message.id.toString(), connection.id);
    // }

    this.serverTransport!.onmessage?.(message)
  }
}
