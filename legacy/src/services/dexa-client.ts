import { type Prompt } from '@dexaai/dexter'
import defaultKy, { type KyInstance } from 'ky'

import { assert, getEnv } from '../utils.js'

export class DexaClient {
  readonly apiKey: string
  readonly apiBaseUrl: string
  readonly ky: KyInstance

  constructor({
    apiKey = getEnv('DEXA_API_KEY'),
    apiBaseUrl = getEnv('DEXA_API_BASE_URL') ?? 'https://dexa.ai',
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: KyInstance
  } = {}) {
    assert(apiKey, 'DEXA_API_KEY is required')

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl
    this.ky = ky.extend({ prefixUrl: this.apiBaseUrl, timeout: 60_000 })
  }

  async generateResponse({ messages }: { messages: Prompt.Msg[] }) {
    return this.ky
      .post('api/ask-dexa', {
        json: {
          secret: this.apiKey,
          messages
        }
      })
      .json<string>()
  }
}
