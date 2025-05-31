import contentType from 'content-type'
import stableJsonStringify from 'fast-json-stable-stringify'

import { normalizeUrl } from './normalize-url'
import * as sha256 from './sha256'

export async function getFaasRequestCacheKey(request) {
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

      const contentLength = parseInt(request.headers.get('content-length'))

      // TODO: what is a reasonable upper bound for hashing the POST body size?
      if (contentLength && contentLength < 10000) {
        const ct = contentType.parse(
          request.headers.get('content-type') || 'application/octet-stream'
        )
        const type = ct && ct.type
        let hash

        // TODO: gracefully handle content-encoding compression
        // TODO: more robust content-type detection

        if (type && type.indexOf('json') >= 0) {
          const bodyJson = await request.clone().json()
          const bodyString = stableJsonStringify(bodyJson)
          hash = await sha256.fromString(bodyString)
        } else if (type && type.indexOf('text/') >= 0) {
          const bodyString = await request.clone().text()
          hash = await sha256.fromString(bodyString)
        } else {
          const bodyBuffer = await request.clone().arrayBuffer()
          hash = await sha256.fromBuffer(bodyBuffer)
        }

        const cacheUrl = new URL(request.url)
        cacheUrl.pathname = cacheUrl.pathname + '/' + hash

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

function normalizeRequestHeaders(request) {
  const headers = Object.fromEntries(request.headers.entries())
  const keys = Object.keys(headers)

  for (const key of keys) {
    if (!requestHeaderWhitelist.has(key)) {
      request.headers.delete(key)
    }
  }

  return request
}
