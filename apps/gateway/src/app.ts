import { assert } from '@agentic/platform-core'
import {
  applyRateLimitHeaders,
  cors,
  errorHandler,
  init,
  responseTime,
  sentry
} from '@agentic/platform-hono'
import { parseToolIdentifier } from '@agentic/platform-validators'
import { Hono } from 'hono'

import type { GatewayHonoEnv } from './lib/types'
import { createAgenticClient } from './lib/agentic-client'
import { createHttpResponseFromMcpToolCallResponse } from './lib/create-http-response-from-mcp-tool-call-response'
import { reportToolCallUsage } from './lib/report-tool-call-usage'
import { resolveHttpEdgeRequest } from './lib/resolve-http-edge-request'
import { resolveMcpEdgeRequest } from './lib/resolve-mcp-edge-request'
import { resolveOriginToolCall } from './lib/resolve-origin-tool-call'
import { isRequestPubliclyCacheable } from './lib/utils'
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
  const gatewayStartTimeMs = Date.now()
  ctx.set('cache', caches.default)
  ctx.set(
    'client',
    createAgenticClient({
      env: ctx.env,
      cache: caches.default,
      waitUntil: ctx.executionCtx.waitUntil.bind(ctx.executionCtx),
      isCachingEnabled: isRequestPubliclyCacheable(ctx.req.raw)
    })
  )

  const requestUrl = new URL(ctx.req.url)
  const { pathname } = requestUrl
  const requestedToolIdentifier = pathname.replace(/^\//, '').replace(/\/$/, '')
  const { toolName } = parseToolIdentifier(requestedToolIdentifier)

  if (toolName === 'mcp') {
    ctx.set('isJsonRpcRequest', true)
    const executionCtx = ctx.executionCtx as any
    const mcpInfo = await resolveMcpEdgeRequest(ctx)
    executionCtx.props = mcpInfo

    // Handle MCP requests
    return DurableMcpServer.serve(pathname, {
      binding: 'DO_MCP_SERVER'
    }).fetch(ctx.req.raw, ctx.env, executionCtx)
  }

  const resolvedHttpEdgeRequest = await resolveHttpEdgeRequest(ctx)

  const originStartTimeMs = Date.now()

  const resolvedOriginToolCallResult = await resolveOriginToolCall({
    tool: resolvedHttpEdgeRequest.tool,
    args: resolvedHttpEdgeRequest.toolCallArgs,
    deployment: resolvedHttpEdgeRequest.deployment,
    consumer: resolvedHttpEdgeRequest.consumer,
    pricingPlan: resolvedHttpEdgeRequest.pricingPlan,
    cacheControl: resolvedHttpEdgeRequest.cacheControl,
    sessionId: ctx.get('sessionId')!,
    ip: ctx.get('ip'),
    env: ctx.env,
    waitUntil: ctx.executionCtx.waitUntil.bind(ctx.executionCtx)
  })

  let originResponse: Response | undefined
  if (resolvedOriginToolCallResult.originResponse) {
    originResponse = resolvedOriginToolCallResult.originResponse
  } else {
    originResponse = await createHttpResponseFromMcpToolCallResponse(ctx, {
      tool: resolvedHttpEdgeRequest.tool,
      deployment: resolvedHttpEdgeRequest.deployment,
      toolCallResponse: resolvedOriginToolCallResult.toolCallResponse
    })
  }

  assert(originResponse, 500, 'Origin response is required')
  const res = new Response(originResponse.body, originResponse)

  if (resolvedOriginToolCallResult.rateLimitResult) {
    applyRateLimitHeaders({
      res,
      rateLimitResult: resolvedOriginToolCallResult.rateLimitResult
    })
  }

  // Record the time it took for the origin to respond.
  const now = Date.now()
  const originTimespanMs = now - originStartTimeMs
  res.headers.set('x-origin-response-time', `${originTimespanMs}ms`)

  const gatewayTimespanMs = now - gatewayStartTimeMs
  res.headers.set('x-response-time', `${gatewayTimespanMs}ms`)

  reportToolCallUsage({
    ...resolvedHttpEdgeRequest,
    requestMode: 'http',
    resolvedOriginToolCallResult,
    sessionId: ctx.get('sessionId')!,
    requestId: ctx.get('requestId')!,
    ip: ctx.get('ip'),
    originTimespanMs,
    gatewayTimespanMs,
    env: ctx.env,
    waitUntil: ctx.executionCtx.waitUntil.bind(ctx.executionCtx)
  })

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
})
