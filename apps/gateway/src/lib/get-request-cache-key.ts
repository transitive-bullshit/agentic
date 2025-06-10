import { hashObject, sha256 } from '@agentic/platform-core'
import contentType from 'fast-content-type-parse'

import { isCacheControlPubliclyCacheable } from './is-cache-control-publicly-cacheable'
import { normalizeUrl } from './normalize-url'

// TODO: what is a reasonable upper bound for hashing the POST body size?
const MAX_POST_BODY_SIZE_BYTES = 10_000

export async function getRequestCacheKey(
  request: Request
): Promise<Request | undefined> {
  try {
    const pragma = request.headers.get('pragma')
    if (pragma === 'no-cache') {
      return
    }

    const cacheControl = request.headers.get('cache-control')
    if (!isCacheControlPubliclyCacheable(cacheControl)) {
      return
    }

    if (request.method === 'POST' || request.method === 'PUT') {
      const contentLength = Number.parseInt(
        request.headers.get('content-length') ?? '0'
      )

      if (contentLength && contentLength < MAX_POST_BODY_SIZE_BYTES) {
        const { type } = contentType.safeParse(
          request.headers.get('content-type') || 'application/octet-stream'
        )
        let hash: string

        if (type.includes('json')) {
          const bodyJson: any = await request.clone().json()
          hash = hashObject(bodyJson)
        } else if (type.includes('text/')) {
          const bodyString = await request.clone().text()
          hash = await sha256(bodyString)
        } else {
          const bodyBuffer = await request.clone().arrayBuffer()
          hash = await sha256(bodyBuffer)
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

      return
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
    return
  }
}

const requestHeaderWhitelist = new Set(['cache-control', 'mcp-session-id'])

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
