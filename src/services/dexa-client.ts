import defaultKy, { type KyInstance } from 'ky'

import type * as types from '../types.js'
import { assert, getEnv } from '../utils.js'

export class DexaClient {
  readonly apiKey: string
  readonly apiBaseUrl: string
  readonly ky: KyInstance

  constructor({
    apiKey = getEnv('DEXA_API_KEY'),
    apiBaseUrl = getEnv('DEXA_API_BASE_URL') ?? 'https://dexa.ai',
    timeoutMs = 60_000,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    timeoutMs?: number
    ky?: KyInstance
  } = {}) {
    assert(apiKey, 'DexaClient missing required "apiKey"')

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({ prefixUrl: this.apiBaseUrl, timeout: timeoutMs })
  }

  async askDexa({ messages }: { messages: types.Msg[] }) {
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
