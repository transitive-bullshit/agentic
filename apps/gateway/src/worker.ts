import { AgenticApiClient } from '@agentic/platform-api-client'
import { assert, parseZodSchema } from '@agentic/platform-core'
import defaultKy from 'ky'

import type { Context } from './lib/types'
import { type AgenticEnv, envSchema } from './lib/env'
import { fetchCache } from './lib/fetch-cache'
import { getRequestCacheKey } from './lib/get-request-cache-key'
import { handleOptions } from './lib/handle-options'
import { resolveOriginRequest } from './lib/resolve-origin-request'

// Export Durable Objects for cloudflare
export { DurableObjectRateLimiter } from './durable-object'

export default {
  async fetch(
    inputReq: Request,
    inputEnv: Env,
    inputCtx: ExecutionContext
  ): Promise<Response> {
    const gatewayStartTime = Date.now()
    let originStartTime: number
    let originTimespan: number
    let gatewayTimespan: number
    let res: Response
    let env: AgenticEnv

    try {
      env = parseZodSchema(envSchema, inputEnv)
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

    function recordTimespans() {
      const now = Date.now()
      originTimespan = now - originStartTime!
      gatewayTimespan = now - gatewayStartTime
    }

    const cache = caches.default
    const client = new AgenticApiClient({
      apiBaseUrl: env.AGENTIC_API_BASE_URL,
      apiKey: env.AGENTIC_API_KEY,
      ky: defaultKy.extend({
        hooks: {
          // NOTE: The order of the `beforeRequest` hook matters, and it only
          // works alongside the one in AgenticApiClient because that one's body
          // should never be run. This only works because we're using `apiKey`
          // authentication, which is a lil hacky since it's actually a long-
          // lived access token.
          beforeRequest: [
            async (request) => {
              // Check the cache first before making a request to Agentic's
              // backend API.
              return cache.match(request)
            }
          ],

          afterResponse: [
            async (request, _options, response) => {
              if (response.headers.has('Cache-Control')) {
                // Asynchronously update the cache with the response from
                // Agentic's backend API.
                inputCtx.waitUntil(
                  cache.put(request, response.clone()).catch((err) => {
                    console.warn('cache put error', request, err)
                  })
                )
              }
            }
          ]
        }
      })
    })

    // NOTE: We have to mutate the given ExecutionContext because spreading it
    // into a new object causes its methods to be `undefined`.
    const ctx = inputCtx as Context
    ctx.req = inputReq
    ctx.env = env
    ctx.client = client
    ctx.cache = cache

    try {
      if (inputReq.method === 'OPTIONS') {
        return handleOptions(inputReq)
      }

      const resolvedOriginRequest = await resolveOriginRequest(ctx)

      try {
        originStartTime = Date.now()
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

        // Record the time it took for both the origin and gateway proxy to respond
        recordTimespans()
        res.headers.set('x-response-time', `${originTimespan!}ms`)
        res.headers.set('x-proxy-response-time', `${gatewayTimespan!}ms`)

        // Reset server to agentic because Cloudflare likes to override things
        res.headers.set('server', 'agentic')

        // const id: DurableObjectId = env.DO_RATE_LIMITER.idFromName('foo')
        // const stub = env.DO_RATE_LIMITER.get(id)
        // const greeting = await stub.sayHello('world')

        // return new Response(greeting)

        return res
      } catch (err: any) {
        console.error(err)
        recordTimespans()

        res = new Response(
          JSON.stringify({
            error: err.message,
            type: err.type,
            code: err.code
          }),
          { status: 500 }
        )

        return res
      } finally {
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
      }
    } catch (err: any) {
      console.error(err)

      if (err.response) {
        return err.response
      } else {
        return new Response(
          JSON.stringify({
            error: err.message,
            // TODO: hide internal error message details?
            // error: 'internal',
            type: err.type,
            code: err.code
          }),
          {
            status: 500
          }
        )
      }
    }
  }
} satisfies ExportedHandler<Env>
