import { hashObject, sha256 } from '@agentic/platform-core'
import contentType from 'fast-content-type-parse'

import { normalizeUrl } from './normalize-url'
import { isRequestPubliclyCacheable } from './utils'

// TODO: what is a reasonable upper bound for hashing the POST body size?
const MAX_POST_BODY_SIZE_BYTES = 10_000

export async function getRequestCacheKey(
  request: Request
): Promise<Request | undefined> {
  try {
    if (!isRequestPubliclyCacheable(request)) {
      return
    }

    if (
      request.method === 'POST' ||
      request.method === 'PUT' ||
      request.method === 'PATCH'
    ) {
      const contentLength = Number.parseInt(
        request.headers.get('content-length') ?? '0'
      )

      if (contentLength < MAX_POST_BODY_SIZE_BYTES) {
        const { type } = contentType.safeParse(
          request.headers.get('content-type') || 'application/octet-stream'
        )
        let hash = '___AGENTIC_CACHE_KEY_EMPTY_BODY___'

        if (contentLength > 0) {
          if (type.includes('json')) {
            const bodyJson: any = await request.clone().json()
            hash = await hashObject(bodyJson)
          } else if (type.includes('text/')) {
            const bodyString = await request.clone().text()
            hash = await sha256(bodyString)
          } else {
            const bodyBuffer = await request.clone().arrayBuffer()
            hash = await sha256(bodyBuffer)
          }
        }

        const cacheUrl = new URL(request.url)
        cacheUrl.searchParams.set('x-agentic-cache-key', hash)
        const normalizedUrl = normalizeUrl(cacheUrl.toString())

        // Convert POST and PUT requests to GET with a query param containing
        // a hash of the request body. This enables us to cache these requests
        // more easily, since we want to move the the "cacheability" logic to a
        // higher-level, config-based approach. E.g., individual tools can
        // opt-in to aggressive caching by declaring themselves `pure` or
        // `immutable` regardless of the HTTP method used to call the tool.
        const newReq = normalizeRequestHeaders(
          new Request(normalizedUrl, {
            headers: request.headers,
            method: 'GET'
          })
        )

        return newReq
      }
    } else if (request.method === 'GET' || request.method === 'HEAD') {
      const url = request.url
      const normalizedUrl = normalizeUrl(url)

      if (url !== normalizedUrl) {
        return normalizeRequestHeaders(
          new Request(normalizedUrl, {
            method: request.method
          })
        )
      }
    }

    return normalizeRequestHeaders(new Request(request))
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      'warning: failed to compute cache key',
      request.method,
      request.url,
      err
    )
  }
}

const requestHeaderWhitelist = new Set([
  'cache-control',
  'content-type',
  'mcp-session-id'
])

function normalizeRequestHeaders(request: Request) {
  const headers = Object.fromEntries(request.headers.entries())
  const keys = Object.keys(headers)

  for (const key of keys) {
    if (!requestHeaderWhitelist.has(key)) {
      request.headers.delete(key)
    }
  }

  return request
}
