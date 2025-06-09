import { assert } from '@agentic/platform-core'
import {
  cors,
  errorHandler,
  init,
  responseTime,
  sentry
} from '@agentic/platform-hono'
import { parseToolIdentifier } from '@agentic/platform-validators'
import { Hono } from 'hono'

import type { GatewayHonoEnv, McpToolCallResponse } from './lib/types'
import { createAgenticClient } from './lib/agentic-client'
import { createHttpResponseFromMcpToolCallResponse } from './lib/create-http-response-from-mcp-tool-call-response'
import { fetchCache } from './lib/fetch-cache'
import { getRequestCacheKey } from './lib/get-request-cache-key'
import { resolveMcpEdgeRequest } from './lib/resolve-mcp-edge-request'
import { resolveOriginRequest } from './lib/resolve-origin-request'
import { DurableMcpServer } from './worker'

export const app = new Hono<GatewayHonoEnv>()

app.onError(errorHandler)
app.use(sentry())

// TODO: Compression is causing a weird bug on dev even for simple responses.
// I think it's because wrangler is changing the response to be streamed
// with `transfer-encoding: chunked`, which is not compatible with
// `hono/compress`.
// app.use(compress())

app.use(
  cors({
    origin: '*',
    allowHeaders: ['Content-Type', 'Authorization', 'mcp-session-id'],
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length', 'mcp-session-id'],
    maxAge: 86_400,
    credentials: true
  })
)
app.use(init)

// Wrangler does this for us. TODO: Does this happen on prod?
// app.use(accessLogger)

app.use(responseTime)

app.all(async (ctx) => {
  ctx.set('cache', caches.default)
  ctx.set('client', createAgenticClient(ctx))

  const requestUrl = new URL(ctx.req.url)
  const { pathname } = requestUrl
  const requestedToolIdentifier = pathname.replace(/^\//, '').replace(/\/$/, '')
  const { toolName } = parseToolIdentifier(requestedToolIdentifier)

  if (toolName === 'mcp') {
    const executionCtx = ctx.executionCtx as any
    const mcpInfo = await resolveMcpEdgeRequest(ctx)
    executionCtx.props = mcpInfo

    // Handle MCP requests
    return DurableMcpServer.serve(pathname, {
      binding: 'DO_MCP_SERVER'
    }).fetch(ctx.req.raw, ctx.env, executionCtx)
  }

  const resolvedOriginRequest = await resolveOriginRequest(ctx)

  const originStartTime = Date.now()
  let originResponse: Response | undefined

  switch (resolvedOriginRequest.deployment.originAdapter.type) {
    case 'openapi':
    case 'raw': {
      assert(
        resolvedOriginRequest.originRequest,
        500,
        'Origin request is required'
      )

      const cacheKey = await getRequestCacheKey(
        ctx,
        resolvedOriginRequest.originRequest
      )

      // TODO: transform origin 5XX errors to 502 errors...
      originResponse = await fetchCache(ctx, {
        cacheKey,
        fetchResponse: () => fetch(resolvedOriginRequest.originRequest!)
      })
      break
    }

    case 'mcp': {
      assert(
        resolvedOriginRequest.toolCallArgs,
        500,
        'Tool args are required for MCP origin requests'
      )
      assert(
        resolvedOriginRequest.originMcpClient,
        500,
        'MCP client is required for MCP origin requests'
      )

      // TODO: add timeout support to the origin tool call?
      // TODO: add response caching for MCP tool calls
      const toolCallResponseString =
        await resolvedOriginRequest.originMcpClient.callTool({
          name: resolvedOriginRequest.tool.name,
          args: resolvedOriginRequest.toolCallArgs,
          metadata: resolvedOriginRequest.originMcpRequestMetadata!
        })
      const toolCallResponse = JSON.parse(
        toolCallResponseString
      ) as McpToolCallResponse

      originResponse = await createHttpResponseFromMcpToolCallResponse(ctx, {
        tool: resolvedOriginRequest.tool,
        deployment: resolvedOriginRequest.deployment,
        toolCallResponse
      })
    }
  }

  assert(originResponse, 500, 'Origin response is required')
  const res = new Response(originResponse.body, originResponse)

  // Record the time it took for both the origin and gateway to respond
  const now = Date.now()
  const originTimespan = now - originStartTime
  res.headers.set('x-origin-response-time', `${originTimespan}ms`)

  // Reset server to Agentic because Cloudflare likes to override things
  res.headers.set('server', 'agentic')

  // Remove extra Cloudflare headers
  res.headers.delete('x-powered-by')
  res.headers.delete('via')
  res.headers.delete('nel')
  res.headers.delete('report-to')
  res.headers.delete('server-timing')
  res.headers.delete('reporting-endpoints')

  return res

  // TODO: move this `finally` block to a middleware handler
  // const now = Date.now()
  // Report usage.
  // Note that we are not awaiting the results of this on purpose so we can
  // return the response to the client immediately.
  // TODO
  // ctx.waitUntil(
  //   reportUsage(ctx, {
  //     ...call,
  //     cache: res!.headers.get('cf-cache-status'),
  //     status: res!.status,
  //     timestamp: Math.ceil(now / 1000),
  //     computeTime: originTimespan!,
  //     gatewayTime: gatewayTimespan!,
  //     // TODO: record correct bandwidth of request + response content-length
  //     bandwidth: 0
  //   })
  // )
})
