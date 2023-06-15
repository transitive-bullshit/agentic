import * as anthropic from '@anthropic-ai/sdk'
import { OpenAIClient } from '@agentic/openai-fetch'
import KeyvRedis from '@keyv/redis'
import 'dotenv/config'
import hashObject from 'hash-obj'
import Redis from 'ioredis'
import Keyv from 'keyv'
import defaultKy from 'ky'
import pMemoize from 'p-memoize'

import { Agentic } from '@/agentic'
import { normalizeUrl } from '@/url-utils'

export const fakeOpenAIAPIKey = 'fake-openai-api-key'
export const fakeAnthropicAPIKey = 'fake-anthropic-api-key'

export const env = process.env.NODE_ENV || 'development'
export const isTest = env === 'test'
export const isCI = process.env.CI === 'true'
export const refreshTestCache = process.env.REFRESH_TEST_CACHE === 'true'

if (isCI && refreshTestCache) {
  throw new Error('REFRESH_TEST_CACHE must be disabled in CI')
}

const redis = new Redis(process.env.REDIS_URL_TEST!)
const keyvRedis = new KeyvRedis(redis)
const keyv = new Keyv({ store: keyvRedis, namespace: 'agentic-test' })

// TODO: this is a lil hacky
const keyvHas = (keyv.has as any).bind(keyv)

keyv.has = async (key, ...rest) => {
  if (refreshTestCache) {
    return undefined
  }

  // console.log('<<< keyv.has', key)
  const res = await keyvHas(key, ...rest)
  // console.log('>>> keyv.has', key, res)
  return res
}

function getCacheKeyForRequest(request: Request): string | null {
  const method = request.method.toLowerCase()

  if (method === 'get') {
    const url = normalizeUrl(request.url)

    if (url) {
      const cacheParams = {
        // TODO: request.headers isn't a normal JS object...
        headers: { ...request.headers }
      }

      // console.log('getCacheKeyForRequest', { url, cacheParams })
      const cacheKey = getCacheKey(`http:${method} ${url}`, cacheParams)
      return cacheKey
    }
  }

  return null
}

/**
 * Custom `ky` instance that caches GET JSON requests.
 *
 * TODO:
 *  - support non-GET requests
 *  - support non-JSON responses
 */
export const ky = defaultKy.extend({
  hooks: {
    beforeRequest: [
      async (request) => {
        try {
          // console.log(`beforeRequest ${request.method} ${request.url}`)

          const cacheKey = getCacheKeyForRequest(request)
          // console.log({ cacheKey })
          if (!cacheKey) {
            return
          }

          if (!(await keyv.has(cacheKey))) {
            return
          }

          const cachedResponse = await keyv.get(cacheKey)
          // console.log({ cachedResponse })

          if (!cachedResponse) {
            return
          }

          return new Response(JSON.stringify(cachedResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          })
        } catch (err) {
          console.error('ky beforeResponse cache error', err)
        }
      }
    ],

    afterResponse: [
      async (request, _options, response) => {
        try {
          // console.log(
          //   `afterRequest ${request.method} ${request.url} ⇒ ${response.status}`
          // )

          if (response.status < 200 || response.status >= 300) {
            return
          }

          const cacheKey = getCacheKeyForRequest(request)
          // console.log({ cacheKey })
          if (!cacheKey) {
            return
          }

          const responseBody = await response.json()
          // console.log({ responseBody })

          await keyv.set(cacheKey, responseBody)
        } catch (err) {
          console.error('ky afterResponse cache error', err)
        }
      }
    ]
  }
})

export class OpenAITestClient extends OpenAIClient {
  createChatCompletion = pMemoize(super.createChatCompletion, {
    cacheKey: (params) => getCacheKey('openai:chat', params),
    cache: keyv
  })
}

export class AnthropicTestClient extends anthropic.Client {
  complete = pMemoize(super.complete, {
    cacheKey: (params) => getCacheKey('anthropic:complete', params),
    cache: keyv
  })
}

export function getCacheKey(label: string, params: any): string {
  const hash = hashObject(params, { algorithm: 'sha256' })
  return `${label}:${hash}`
}

export function createOpenAITestClient() {
  const apiKey = isCI
    ? fakeOpenAIAPIKey
    : process.env.OPENAI_API_KEY ?? fakeOpenAIAPIKey

  if (refreshTestCache) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        'Cannot refresh test cache without OPENAI_API_KEY environment variable.'
      )
    }
  }

  return new OpenAITestClient({ apiKey })
}

export function createAnthropicTestClient() {
  const apiKey = isCI
    ? fakeAnthropicAPIKey
    : process.env.ANTHROPIC_API_KEY ?? fakeAnthropicAPIKey

  if (refreshTestCache) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        'Cannot refresh test cache without ANTHROPIC_API_KEY environment variable.'
      )
    }
  }

  return new AnthropicTestClient(apiKey)
}

export function createTestAgenticRuntime() {
  const openai = createOpenAITestClient()
  const anthropic = createAnthropicTestClient()

  const agentic = new Agentic({ openai, anthropic, ky })
  return agentic
}
