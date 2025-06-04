import { hashObject, sha256 } from '@agentic/platform-core'
import contentType from 'fast-content-type-parse'

import type { GatewayHonoContext } from './types'
import { normalizeUrl } from './normalize-url'

// TODO: what is a reasonable upper bound for hashing the POST body size?
const MAX_POST_BODY_SIZE_BYTES = 10_000

export async function getRequestCacheKey(
  ctx: GatewayHonoContext,
  request: Request
): Promise<Request | undefined> {
  try {
    const pragma = request.headers.get('pragma')
    if (pragma === 'no-cache') {
      return
    }

    const cacheControl = request.headers.get('cache-control')
    if (cacheControl) {
      const directives = new Set(cacheControl.split(',').map((s) => s.trim()))
      if (directives.has('no-store') || directives.has('no-cache')) {
        return
      }
    }

    if (request.method === 'POST' || request.method === 'PUT') {
      // useful for debugging since getting all the headers is awkward
      // console.log(Object.fromEntries(request.headers.entries()))

      const contentLength = Number.parseInt(
        request.headers.get('content-length') ?? '0'
      )

      if (contentLength && contentLength < MAX_POST_BODY_SIZE_BYTES) {
        const { type } = contentType.safeParse(
          request.headers.get('content-type') || 'application/octet-stream'
        )
        let hash

        // TODO: gracefully handle content-encoding compression
        // TODO: more robust content-type detection

        if (type.includes('json')) {
          const bodyJson: any = await request.clone().json()
          hash = hashObject(bodyJson)
        } else if (type.includes('text/')) {
          const bodyString = await request.clone().text()
          hash = await sha256(bodyString)
        } else {
          // TODO
          // const bodyBuffer = await request.clone().arrayBuffer()
          // hash = await sha256.fromBuffer(bodyBuffer)
          return
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
    const logger = ctx.get('logger')
    logger.error('error computing cache key', request.method, request.url, err)
    return
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
