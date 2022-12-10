import ExpiryMap from 'expiry-map'
import pTimeout, { TimeoutError } from 'p-timeout'
import { ProxyAgent, setGlobalDispatcher } from 'undici'
import { v4 as uuidv4 } from 'uuid'

import * as types from './types'
import { ChatGPTConversation } from './chatgpt-conversation'
import { fetch } from './fetch'
import { fetchSSE } from './fetch-sse'
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

  // Stores access tokens for `accessTokenTTL` milliseconds before needing to refresh
  // (defaults to 60 seconds)
  protected _accessTokenCache: ExpiryMap<string, string>

  protected _proxyAgent: ProxyAgent

  /**
   * Creates a new client wrapper around the unofficial ChatGPT REST API.
   *
   * @param opts.sessionToken = **Required** OpenAI session token which can be found in a valid session's cookies (see readme for instructions)
   * @param apiBaseUrl - Optional override; the base URL for ChatGPT webapp's API (`/api`)
   * @param backendApiBaseUrl - Optional override; the base URL for the ChatGPT backend API (`/backend-api`)
   * @param userAgent - Optional override; the `user-agent` header to use with ChatGPT requests
   * @param accessTokenTTL - Optional override; how long in milliseconds access tokens should last before being forcefully refreshed
   * @param proxyUrl - Optional override; the proxy url for ChatGPT (`http://localhost:1080` or `http://user:pass@localhost:1080`)
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

    /** @defaultValue 60000 (60 seconds) */
    accessTokenTTL?: number

    /** @defaultValue `''` */
    proxyUrl?: string
  }) {
    const {
      sessionToken,
      markdown = true,
      apiBaseUrl = 'https://chat.openai.com/api',
      backendApiBaseUrl = 'https://chat.openai.com/backend-api',
      userAgent = USER_AGENT,
      accessTokenTTL = 60000, // 60 seconds
      proxyUrl = ''
    } = opts

    this._sessionToken = sessionToken
    this._markdown = !!markdown
    this._apiBaseUrl = apiBaseUrl
    this._backendApiBaseUrl = backendApiBaseUrl
    this._userAgent = userAgent

    this._accessTokenCache = new ExpiryMap<string, string>(accessTokenTTL)

    if (proxyUrl) {
      this._proxyAgent = new ProxyAgent(proxyUrl)
      setGlobalDispatcher(this._proxyAgent)
    }

    if (!this._sessionToken) {
      throw new Error('ChatGPT invalid session token')
    }
  }

  /**
   * Sends a message to ChatGPT, waits for the response to resolve, and returns
   * the response.
   *
   * If you want to receive a stream of partial responses, use `opts.onProgress`.
   * If you want to receive the full response, including message and conversation IDs,
   * you can use `opts.onConversationResponse` or use the `ChatGPTAPI.getConversation`
   * helper.
   *
   * @param message - The prompt message to send
   * @param opts.conversationId - Optional ID of a conversation to continue
   * @param opts.parentMessageId - Optional ID of the previous message in the conversation
   * @param opts.timeoutMs - Optional timeout in milliseconds (defaults to no timeout)
   * @param opts.onProgress - Optional callback which will be invoked every time the partial response is updated
   * @param opts.onConversationResponse - Optional callback which will be invoked every time the partial response is updated with the full conversation response
   * @param opts.abortSignal - Optional callback used to abort the underlying `fetch` call using an [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
   *
   * @returns The response from ChatGPT
   */
  async sendMessage(
    message: string,
    opts: types.SendMessageOptions = {}
  ): Promise<string> {
    const {
      conversationId,
      parentMessageId = uuidv4(),
      timeoutMs,
      onProgress,
      onConversationResponse
    } = opts

    let { abortSignal } = opts

    let abortController: AbortController = null
    if (timeoutMs && !abortSignal) {
      abortController = new AbortController()
      abortSignal = abortController.signal
    }

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
      parent_message_id: parentMessageId
    }

    if (conversationId) {
      body.conversation_id = conversationId
    }

    const url = `${this._backendApiBaseUrl}/conversation`
    let response = ''

    const responseP = new Promise<string>((resolve, reject) => {
      fetchSSE(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'User-Agent': this._userAgent
        },
        body: JSON.stringify(body),
        signal: abortSignal,
        onMessage: (data: string) => {
          if (data === '[DONE]') {
            return resolve(response)
          }

          try {
            const parsedData: types.ConversationResponseEvent = JSON.parse(data)
            if (onConversationResponse) {
              onConversationResponse(parsedData)
            }

            const message = parsedData.message
            // console.log('event', JSON.stringify(parsedData, null, 2))

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
              }
            }
          } catch (err) {
            console.warn('fetchSSE onMessage unexpected error', err)
            reject(err)
          }
        }
      }).catch(reject)
    })

    if (timeoutMs) {
      if (abortController) {
        // This will be called when a timeout occurs in order for us to forcibly
        // ensure that the underlying HTTP request is aborted.
        ;(responseP as any).cancel = () => {
          abortController.abort()
        }
      }

      return pTimeout(responseP, {
        milliseconds: timeoutMs,
        message: 'ChatGPT timed out waiting for response'
      })
    } else {
      return responseP
    }
  }

  /**
   * @returns `true` if the client has a valid acces token or `false` if refreshing
   * the token fails.
   */
  async getIsAuthenticated() {
    try {
      void (await this.refreshAccessToken())
      return true
    } catch (err) {
      return false
    }
  }

  /**
   * Refreshes the client's access token which will succeed only if the session
   * is still valid.
   */
  async ensureAuth() {
    return await this.refreshAccessToken()
  }

  /**
   * Attempts to refresh the current access token using the ChatGPT
   * `sessionToken` cookie.
   *
   * Access tokens will be cached for up to `accessTokenTTL` milliseconds to
   * prevent refreshing access tokens too frequently.
   *
   * @returns A valid access token
   * @throws An error if refreshing the access token fails.
   */
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
      }).then((r) => {
        if (!r.ok) {
          throw new Error(`${r.status} ${r.statusText}`)
        }

        return r.json() as any as types.SessionResult
      })

      const accessToken = res?.accessToken

      if (!accessToken) {
        throw new Error('Unauthorized')
      }

      const error = res?.error
      if (error) {
        if (error === 'RefreshAccessTokenError') {
          throw new Error('session token may have expired')
        } else {
          throw new Error(error)
        }
      }

      this._accessTokenCache.set(KEY_ACCESS_TOKEN, accessToken)
      return accessToken
    } catch (err: any) {
      throw new Error(`ChatGPT failed to refresh auth token. ${err.toString()}`)
    }
  }

  /**
   * Gets a new ChatGPTConversation instance, which can be used to send multiple
   * messages as part of a single conversation.
   *
   * @param opts.conversationId - Optional ID of the previous message in a conversation
   * @param opts.parentMessageId - Optional ID of the previous message in a conversation
   * @returns The new conversation instance
   */
  getConversation(
    opts: { conversationId?: string; parentMessageId?: string } = {}
  ) {
    return new ChatGPTConversation(this, opts)
  }
}
