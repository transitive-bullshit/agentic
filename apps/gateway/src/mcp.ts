// import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
// import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

import type { GatewayHonoContext, ResolvedOriginRequest } from './lib/types'

// TODO: https://github.com/modelcontextprotocol/servers/blob/8fb7bbdab73eddb42aba72e8eab81102efe1d544/src/everything/sse.ts
// TODO: https://github.com/cloudflare/agents

// const transports: Map<string, StreamableHTTPClientTransport> = new Map<
//   string,
//   StreamableHTTPClientTransport
// >()

export async function handleMCPRequest(
  _ctx: GatewayHonoContext,
  _resolvedOriginRequest: ResolvedOriginRequest
) {
  // const server = new McpServer({
  //   name: 'weather',
  //   version: '1.0.0',
  //   capabilities: {
  //     resources: {},
  //     tools: {}
  //   }
  // })
}
