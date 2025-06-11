import type { WaitUntil } from './types'

export async function fetchCache({
  cacheKey,
  fetchResponse,
  waitUntil
}: {
  cacheKey?: Request
  fetchResponse: () => Promise<Response>
  waitUntil: WaitUntil
}): Promise<Response> {
  const cache = caches.default
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
        waitUntil(
          cache.put(cacheKey, response.clone()).catch((err) => {
            // eslint-disable-next-line no-console
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
