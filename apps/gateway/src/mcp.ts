// import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
// import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'

import type { Context, ResolvedOriginRequest } from './lib/types'

// TODO: https://github.com/modelcontextprotocol/servers/blob/8fb7bbdab73eddb42aba72e8eab81102efe1d544/src/everything/sse.ts
// TODO: https://github.com/cloudflare/agents

// const transports: Map<string, SSEServerTransport> = new Map<
//   string,
//   SSEServerTransport
// >()

export async function handleMCPRequest(
  _ctx: Context,
  _resolvedOriginRequest: ResolvedOriginRequest
) {
  // const serverTransport = new SSEServerTransport()
  // const server = new McpServer({
  //   name: 'weather',
  //   version: '1.0.0',
  //   capabilities: {
  //     resources: {},
  //     tools: {}
  //   }
  // })
}
