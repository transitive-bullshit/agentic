// import { parseToolIdentifier } from '@agentic/platform-validators'

import { app } from './app'
// import { DurableMcpServer } from './lib/durable-mcp-server'
import { type Env, parseEnv } from './lib/env'

// Export Durable Objects for cloudflare
export { DurableMcpClient } from './lib/durable-mcp-client'
export { DurableMcpServer } from './lib/durable-mcp-server'
export { DurableRateLimiter } from './lib/durable-rate-limiter'

// Main worker entrypoint
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    let parsedEnv: Env

    // Validate the environment
    try {
      parsedEnv = parseEnv(env)
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          'content-type': 'application/json'
        }
      })
    }

    // const requestUrl = new URL(request.url)
    // const { pathname } = requestUrl
    // const requestedToolIdentifier = pathname
    //   .replace(/^\//, '')
    //   .replace(/\/$/, '')
    // const { toolName } = parseToolIdentifier(requestedToolIdentifier)

    // if (toolName === 'mcp') {
    //   // Handle MCP requests
    //   return DurableMcpServer.serve('/*', {
    //     binding: 'DO_MCP_SERVER'
    //   }).fetch(request, parsedEnv, ctx)
    // }

    // Handle the request with `hono`
    return app.fetch(request, parsedEnv, ctx)
  }
} satisfies ExportedHandler<Env>
