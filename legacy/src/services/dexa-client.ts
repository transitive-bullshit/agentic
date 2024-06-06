import defaultKy, { type KyInstance } from 'ky'
import { z } from 'zod'

import { aiFunction, AIFunctionsProvider } from '../fns.js'
import { Msg } from '../message.js'
import { assert, getEnv } from '../utils.js'

export namespace dexa {
  export const AskDexaOptionsSchema = z.object({
    question: z.string().describe('The question to ask Dexa.')
  })
  export type AskDexaOptions = z.infer<typeof AskDexaOptionsSchema>
}

export class DexaClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiKey: string
  protected readonly apiBaseUrl: string

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
    assert(
      apiKey,
      'DexaClient missing required "apiKey" (defaults to "DEXA_API_KEY")'
    )
    super()

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({ prefixUrl: this.apiBaseUrl, timeout: timeoutMs })
  }

  @aiFunction({
    name: 'ask_dexa',
    description:
      'Answers questions based on knowledge of trusted experts and podcasters. Example experts include: Andrew Huberman, Tim Ferriss, Lex Fridman, Peter Attia, Seth Godin, Rhonda Patrick, Rick Rubin, and more.',
    inputSchema: dexa.AskDexaOptionsSchema
  })
  async askDexa(opts: dexa.AskDexaOptions) {
    return this.ky
      .post('api/ask-dexa', {
        json: {
          secret: this.apiKey,
          messages: [Msg.user(opts.question)]
        }
      })
      .json<string>()
  }
}
