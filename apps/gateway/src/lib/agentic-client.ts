import { AgenticApiClient } from '@agentic/platform-api-client'
import defaultKy from 'ky'

import type { RawEnv } from './env'
import type { WaitUntil } from './types'
import { isCacheControlPubliclyCacheable } from './utils'

export function createAgenticClient({
  env,
  cache,
  waitUntil,
  isCachingEnabled = true
}: {
  env: RawEnv
  cache: Cache
  waitUntil: WaitUntil
  isCachingEnabled?: boolean
}) {
  const client = new AgenticApiClient({
    apiBaseUrl: env.AGENTIC_API_BASE_URL,
    apiKey: env.AGENTIC_API_KEY,
    ky: isCachingEnabled
      ? defaultKy.extend({
          hooks: {
            // NOTE: The order of the `beforeRequest` hook matters, and it only
            // works alongside the one in AgenticApiClient because that one's body
            // should never be run. This only works because we're using `apiKey`
            // authentication, which is a lil hacky since it's actually a long-
            // lived access token.
            beforeRequest: [
              async (request) => {
                // Check the cache first before making a request to Agentic's
                // backend API.
                return cache.match(request)
              }
            ],

            afterResponse: [
              async (request, _options, response) => {
                if (
                  !isCacheControlPubliclyCacheable(
                    response.headers.get('cache-control')
                  )
                ) {
                  return
                }

                // Asynchronously update the cache with the response from
                // Agentic's backend API.
                waitUntil(
                  cache.put(request, response.clone()).catch((err) => {
                    // eslint-disable-next-line no-console
                    console.warn('cache put error', request, err)
                  })
                )
              }
            ]
          }
        })
      : defaultKy
  })

  return client
}
