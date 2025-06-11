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

import type { GatewayHonoEnv, ResolvedOriginToolCallResult } from './lib/types'
import { createAgenticClient } from './lib/agentic-client'
import { createHttpResponseFromMcpToolCallResponse } from './lib/create-http-response-from-mcp-tool-call-response'
import { recordToolCallUsage } from './lib/record-tool-call-usage'
import {
  type ResolvedHttpEdgeRequest,
  resolveHttpEdgeRequest
} from './lib/resolve-http-edge-request'
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
  const waitUntil = ctx.executionCtx.waitUntil.bind(ctx.executionCtx)
  ctx.set('cache', caches.default)
  ctx.set(
    'client',
    createAgenticClient({
      env: ctx.env,
      cache: caches.default,
      isCachingEnabled: isRequestPubliclyCacheable(ctx.req.raw),
      waitUntil
    })
  )

  // TODO: Clean up the duplication between this block,
  // `resolveMcpEdgeRequest`, and `resolveHttpEdgeRequest`.
  const requestUrl = new URL(ctx.req.url)
  const { pathname } = requestUrl
  const requestedToolIdentifier = pathname.replace(/^\//, '').replace(/\/$/, '')
  const { toolName } = parseToolIdentifier(requestedToolIdentifier)

  // Handle MCP requests
  if (toolName === 'mcp') {
    ctx.set('isJsonRpcRequest', true)
    const executionCtx = ctx.executionCtx as any
    const mcpInfo = await resolveMcpEdgeRequest(ctx)
    executionCtx.props = mcpInfo

    return DurableMcpServer.serve(pathname, {
      binding: 'DO_MCP_SERVER'
    }).fetch(ctx.req.raw, ctx.env, executionCtx)
  }

  let resolvedHttpEdgeRequest: ResolvedHttpEdgeRequest | undefined
  let resolvedOriginToolCallResult: ResolvedOriginToolCallResult | undefined
  let originResponse: Response | undefined
  let res: Response | undefined

  try {
    // Resolve the http edge request to a specific deployment, consumer, and
    // tool call.
    resolvedHttpEdgeRequest = await resolveHttpEdgeRequest(ctx)

    // Invoke the origin tool call.
    resolvedOriginToolCallResult = await resolveOriginToolCall({
      ...resolvedHttpEdgeRequest,
      args: resolvedHttpEdgeRequest.toolCallArgs,
      sessionId: ctx.get('sessionId')!,
      ip: ctx.get('ip'),
      env: ctx.env,
      waitUntil
    })

    // Transform the origin tool call response into an http response.
    if (resolvedOriginToolCallResult.originResponse) {
      originResponse = resolvedOriginToolCallResult.originResponse
    } else {
      originResponse = await createHttpResponseFromMcpToolCallResponse(ctx, {
        ...resolvedHttpEdgeRequest,
        toolCallResponse: resolvedOriginToolCallResult.toolCallResponse
      })
    }

    assert(originResponse, 500, 'Origin response is required')

    // Post-process the origin response.
    res = updateResponse(originResponse, resolvedOriginToolCallResult)
    return res
  } catch (err: any) {
    // Convert the error into an http response and post-process it.
    res = errorHandler(err, ctx)
    res = updateResponse(res, resolvedOriginToolCallResult)
    return res
  } finally {
    // Record the tool call usage.
    if (resolvedHttpEdgeRequest && res) {
      recordToolCallUsage({
        ...resolvedHttpEdgeRequest,
        requestMode: 'http',
        httpResponse: res,
        resolvedOriginToolCallResult,
        sessionId: ctx.get('sessionId')!,
        requestId: ctx.get('requestId')!,
        ip: ctx.get('ip'),
        env: ctx.env,
        waitUntil
      })
    }
  }
})

function updateResponse(
  response: Response,
  resolvedOriginToolCallResult?: ResolvedOriginToolCallResult
) {
  const res = new Response(response.body, response)

  if (resolvedOriginToolCallResult) {
    if (resolvedOriginToolCallResult.rateLimitResult) {
      applyRateLimitHeaders({
        res,
        rateLimitResult: resolvedOriginToolCallResult.rateLimitResult
      })
    }

    // Record the time it took for the origin to respond.
    res.headers.set(
      'x-origin-response-time',
      `${resolvedOriginToolCallResult.originTimespanMs}ms`
    )
  }

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
}
