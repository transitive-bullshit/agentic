import { hashObject, sha256 } from '@agentic/platform-core'
import contentType from 'fast-content-type-parse'

import { normalizeUrl } from './normalize-url'

export async function getRequestCacheKey(
  request: Request
): Promise<Request | null> {
  try {
    const pragma = request.headers.get('pragma')
    if (pragma === 'no-cache') {
      return null
    }

    const cacheControl = request.headers.get('cache-control')
    if (cacheControl) {
      const directives = new Set(cacheControl.split(',').map((s) => s.trim()))
      if (directives.has('no-store') || directives.has('no-cache')) {
        return null
      }
    }

    if (request.method === 'POST' || request.method === 'PUT') {
      // useful for debugging since getting all the headers is awkward
      // console.log(Object.fromEntries(request.headers.entries()))

      const contentLength = Number.parseInt(
        request.headers.get('content-length') ?? '0'
      )

      // TODO: what is a reasonable upper bound for hashing the POST body size?
      if (contentLength && contentLength < 10_000) {
        const { type } = contentType.safeParse(
          request.headers.get('content-type') || 'application/octet-stream'
        )
        let hash

        // TODO: gracefully handle content-encoding compression
        // TODO: more robust content-type detection

        if (type?.includes('json')) {
          const bodyJson: any = await request.clone().json()
          hash = hashObject(bodyJson)
        } else if (type?.includes('text/')) {
          const bodyString = await request.clone().text()
          hash = await sha256(bodyString)
        } else {
          // TODO
          // const bodyBuffer = await request.clone().arrayBuffer()
          // hash = await sha256.fromBuffer(bodyBuffer)
          return null
        }

        const cacheUrl = new URL(request.url)
        cacheUrl.searchParams.set('x-agentic-cache-key', hash)
        const normalizedUrl = normalizeUrl(cacheUrl.toString())

        const newReq = normalizeRequestHeaders(
          new Request(normalizedUrl, {
            headers: request.headers,
            method: 'GET'
          })
        )

        return newReq
      }

      return null
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
    console.error('error computing cache key', request.method, request.url, err)
    return null
  }
}

const requestHeaderWhitelist = new Set(['cache-control'])

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
