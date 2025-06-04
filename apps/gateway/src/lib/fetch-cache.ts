import type { GatewayHonoContext } from './types'

export async function fetchCache(
  ctx: GatewayHonoContext,
  {
    cacheKey,
    fetchResponse
  }: {
    cacheKey?: Request
    fetchResponse: () => Promise<Response>
  }
): Promise<Response> {
  const cache = ctx.get('cache')
  const logger = ctx.get('logger')
  let response: Response | undefined

  if (cacheKey) {
    response = await cache.match(cacheKey)
  }

  if (!response) {
    response = await fetchResponse()
    response = new Response(response.body, response)

    if (cacheKey) {
      if (response.headers.has('Cache-Control')) {
        // Note that cloudflare's `cache` should respect response headers.
        ctx.executionCtx.waitUntil(
          cache.put(cacheKey, response.clone()).catch((err) => {
            logger.warn('cache put error', cacheKey, err)
          })
        )
      }

      response.headers.set('cf-cache-status', 'MISS')
    } else {
      response.headers.set('cf-cache-status', 'BYPASS')
    }
  }

  return response
}
