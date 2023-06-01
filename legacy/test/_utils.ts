import * as anthropic from '@anthropic-ai/sdk'
import KeyvRedis from '@keyv/redis'
import 'dotenv/config'
import hashObject from 'hash-obj'
import Redis from 'ioredis'
import Keyv from 'keyv'
import { OpenAIClient } from 'openai-fetch'
import pMemoize from 'p-memoize'

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
