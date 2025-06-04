import { assert } from '@agentic/platform-core'
import {
  cors,
  errorHandler,
  init,
  responseTime,
  sentry
} from '@agentic/platform-hono'
import { Hono } from 'hono'

import type { GatewayHonoEnv } from './lib/types'
import { createAgenticClient } from './lib/agentic-client'
import { type Env, parseEnv } from './lib/env'
import { fetchCache } from './lib/fetch-cache'
import { getRequestCacheKey } from './lib/get-request-cache-key'
import { resolveOriginRequest } from './lib/resolve-origin-request'

// Export Durable Objects for cloudflare
export { DurableObjectRateLimiter } from './durable-object'

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
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
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

      originResponse = await fetchCache(ctx, {
        cacheKey,
        fetchResponse: () => fetch(resolvedOriginRequest.originRequest!)
      })
      break
    }

    case 'mcp':
      throw new Error('MCP not yet supported')
  }

  assert(originResponse, 500, 'Origin response is required')
  const res = new Response(originResponse.body, originResponse)

  // Record the time it took for both the origin and gateway to respond
  const now = Date.now()
  const originTimespan = now - originStartTime
  res.headers.set('x-origin-response-time', `${originTimespan}ms`)

  // Reset server to agentic because Cloudflare likes to override things
  res.headers.set('server', 'agentic')

  res.headers.delete('x-powered-by')
  res.headers.delete('via')
  res.headers.delete('nel')
  res.headers.delete('report-to')
  res.headers.delete('server-timing')
  res.headers.delete('reporting-endpoints')

  // const id: DurableObjectId = env.DO_RATE_LIMITER.idFromName('foo')
  // const stub = env.DO_RATE_LIMITER.get(id)
  // const greeting = await stub.sayHello('world')

  // return new Response(greeting)

  return res

  // TODO: move this `finally` blockto a middleware handler
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

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    let parsedEnv: Env

    try {
      parsedEnv = parseEnv(env)
    } catch (err: any) {
      // TODO: Better error handling
      return new Response(
        JSON.stringify({
          error: err.message,
          type: err.type,
          code: err.code
        }),
        { status: 500 }
      )
    }

    return app.fetch(request, parsedEnv, ctx)
  }
} satisfies ExportedHandler<Env>
