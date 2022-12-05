import { createParser } from 'eventsource-parser'
import ExpiryMap from 'expiry-map'
import fetch from 'node-fetch'
import { v4 as uuidv4 } from 'uuid'

import * as types from './types'
import { markdownToText } from './utils'

const KEY_ACCESS_TOKEN = 'accessToken'
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'

export class ChatGPTAPI {
  protected _sessionToken: string
  protected _markdown: boolean
  protected _apiBaseUrl: string
  protected _backendApiBaseUrl: string
  protected _userAgent: string
  protected _accessTokenCache = new ExpiryMap<string, string>(10 * 1000)

  /**
   * Creates a new client wrapper around the unofficial ChatGPT REST API.
   *
   * @param opts.sessionToken = **Required** OpenAI session token which can be found in a valid session's cookies (see readme for instructions)
   * @param apiBaseUrl - Optional override; the base URL for ChatGPT webapp's API (`/api`)
   * @param backendApiBaseUrl - Optional override; the base URL for the ChatGPT backend API (`/backend-api`)
   * @param userAgent - Optional override; the `user-agent` header to use with ChatGPT requests
   */
  constructor(opts: {
    sessionToken: string

    /** @defaultValue `true` **/
    markdown?: boolean

    /** @defaultValue `'https://chat.openai.com/api'` **/
    apiBaseUrl?: string

    /** @defaultValue `'https://chat.openai.com/backend-api'` **/
    backendApiBaseUrl?: string

    /** @defaultValue `'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36'` **/
    userAgent?: string
  }) {
    const {
      sessionToken,
      markdown = true,
      apiBaseUrl = 'https://chat.openai.com/api',
      backendApiBaseUrl = 'https://chat.openai.com/backend-api',
      userAgent = USER_AGENT
    } = opts

    this._sessionToken = sessionToken
    this._markdown = !!markdown
    this._apiBaseUrl = apiBaseUrl
    this._backendApiBaseUrl = backendApiBaseUrl
    this._userAgent = userAgent

    if (!this._sessionToken) {
      throw new Error('ChatGPT invalid session token')
    }
  }

  async getIsAuthenticated() {
    try {
      void (await this.refreshAccessToken())
      return true
    } catch (err) {
      return false
    }
  }

  async ensureAuth() {
    return await this.refreshAccessToken()
  }

  /**
   * Sends a message to ChatGPT, waits for the response to resolve, and returns
   * the response.
   *
   * @param message - The plaintext message to send.
   * @param opts.conversationId - Optional ID of the previous message in a conversation
   * @param opts.onProgress - Optional listener which will be called every time the partial response is updated
   */
  async sendMessage(
    message: string,
    opts: {
      converstationId?: string
      onProgress?: (partialResponse: string) => void
    } = {}
  ): Promise<string> {
    const { converstationId = uuidv4(), onProgress } = opts

    const accessToken = await this.refreshAccessToken()

    const body: types.ConversationJSONBody = {
      action: 'next',
      messages: [
        {
          id: uuidv4(),
          role: 'user',
          content: {
            content_type: 'text',
            parts: [message]
          }
        }
      ],
      model: 'text-davinci-002-render',
      parent_message_id: converstationId
    }

    const url = `${this._backendApiBaseUrl}/conversation`

    // TODO: What's the best way to differentiate btwn wanting just the response text
    // versus wanting the full response message, so you can extract the ID and other
    // metadata?
    // let fullResponse: types.Message = null
    let response = ''

    return new Promise((resolve, reject) => {
      this._fetchSSE(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'user-agent': this._userAgent
        },
        body: JSON.stringify(body),
        onMessage: (data: string) => {
          if (data === '[DONE]') {
            return resolve(response)
          }

          try {
            const parsedData: types.ConversationResponseEvent = JSON.parse(data)
            const message = parsedData.message
            console.log('event', JSON.stringify(parsedData, null, 2))

            if (message) {
              let text = message?.content?.parts?.[0]

              if (text) {
                if (!this._markdown) {
                  text = markdownToText(text)
                }

                response = text

                if (onProgress) {
                  onProgress(text)
                }
                // fullResponse = message
              }
            }
          } catch (err) {
            console.warn('fetchSSE onMessage unexpected error', err)
            reject(err)
          }
        }
      }).catch(reject)
    })
  }

  async refreshAccessToken(): Promise<string> {
    const cachedAccessToken = this._accessTokenCache.get(KEY_ACCESS_TOKEN)
    if (cachedAccessToken) {
      return cachedAccessToken
    }

    try {
      const res = await fetch('https://chat.openai.com/api/auth/session', {
        headers: {
          cookie: `__Secure-next-auth.session-token=${this._sessionToken}`,
          'user-agent': this._userAgent
        }
      }).then((r) => r.json() as any as types.SessionResult)

      const accessToken = res?.accessToken

      if (!accessToken) {
        console.warn('no auth token', res)
        throw new Error('Unauthorized')
      }

      this._accessTokenCache.set(KEY_ACCESS_TOKEN, accessToken)
      return accessToken
    } catch (err: any) {
      throw new Error(`ChatGPT failed to refresh auth token: ${err.toString()}`)
    }
  }

  protected async _fetchSSE(
    url: string,
    options: Parameters<typeof fetch>[1] & { onMessage: (data: string) => void }
  ) {
    const { onMessage, ...fetchOptions } = options
    const resp = await fetch(url, fetchOptions)
    const parser = createParser((event) => {
      if (event.type === 'event') {
        onMessage(event.data)
      }
    })

    resp.body.on('readable', () => {
      let chunk: string | Buffer
      while (null !== (chunk = resp.body.read())) {
        parser.feed(chunk.toString())
      }
    })
  }
}
