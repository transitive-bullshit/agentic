import { AgenticApiClient } from '@agentic/platform-api-client'
import { parseZodSchema } from '@agentic/platform-core'

import type { Context } from './lib/types'
import { type AgenticEnv, envSchema } from './lib/env'
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

    const client = new AgenticApiClient({
      apiBaseUrl: env.AGENTIC_API_BASE_URL,
      apiKey: env.AGENTIC_API_KEY
    })

    const ctx: Context = {
      ...inputCtx,
      req: inputReq,
      env,
      client
    }

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
            originResponse = await fetch(resolvedOriginRequest.originRequest!)
            break

          case 'raw':
            originResponse = await fetch(resolvedOriginRequest.originRequest!)
            break

          case 'mcp':
            throw new Error('MCP not yet supported')
        }

        const res = new Response(originResponse.body, originResponse)
        recordTimespans()

        // Record the time it took for both the origin and gateway proxy to respond
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
