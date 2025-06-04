import { AgenticApiClient } from '@agentic/platform-api-client'
import defaultKy from 'ky'

import type { GatewayHonoContext } from './types'

export function createAgenticClient(ctx: GatewayHonoContext) {
  const cache = ctx.get('cache')

  const client = new AgenticApiClient({
    apiBaseUrl: ctx.env.AGENTIC_API_BASE_URL,
    apiKey: ctx.env.AGENTIC_API_KEY,
    ky: defaultKy.extend({
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
            if (response.headers.has('Cache-Control')) {
              // Asynchronously update the cache with the response from
              // Agentic's backend API.
              ctx.executionCtx.waitUntil(
                cache.put(request, response.clone()).catch((err) => {
                  console.warn('cache put error', request, err)
                })
              )
            }
          }
        ]
      }
    })
  })

  return client
}
