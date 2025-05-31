import type { Context } from './types'

const cache = caches.default

export async function fetchCache(
  ctx: Context,
  {
    cacheKey,
    fetchResponse
  }: {
    cacheKey?: string
    fetchResponse: () => Promise<Response>
  }
) {
  let response

  if (cacheKey) {
    response = await cache.match(cacheKey)
  }

  if (!response) {
    response = await fetchResponse()
    response = new Response(response.body, response)

    if (cacheKey) {
      if (response.headers.has('Cache-Control')) {
        // cache will respect response headers
        ctx.waitUntil(
          cache.put(cacheKey, response.clone()).catch((err) => {
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
