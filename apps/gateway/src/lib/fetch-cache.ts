import type { Context } from './types'

export async function fetchCache(
  ctx: Context,
  {
    cacheKey,
    fetchResponse
  }: {
    cacheKey?: Request
    fetchResponse: () => Promise<Response>
  }
): Promise<Response> {
  let response: Response | undefined

  if (cacheKey) {
    response = await ctx.cache.match(cacheKey)
  }

  if (!response) {
    response = await fetchResponse()
    response = new Response(response.body, response)

    if (cacheKey) {
      if (response.headers.has('Cache-Control')) {
        // Note that cloudflare's `cache` should respect response headers.
        ctx.waitUntil(
          ctx.cache.put(cacheKey, response.clone()).catch((err) => {
            console.warn('cache put error', cacheKey, err)
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
