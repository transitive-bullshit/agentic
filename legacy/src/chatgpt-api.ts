import ExpiryMap from 'expiry-map'
import pTimeout from 'p-timeout'
import { v4 as uuidv4 } from 'uuid'

import * as types from './types'
import { AChatGPTAPI } from './abstract-chatgpt-api'
import { fetch } from './fetch'
import { fetchSSE } from './fetch-sse'
import { markdownToText } from './utils'

const KEY_ACCESS_TOKEN = 'accessToken'
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'

export class ChatGPTAPI extends AChatGPTAPI {
  protected _sessionToken: string
  protected _clearanceToken: string
  protected _markdown: boolean
  protected _debug: boolean
  protected _apiBaseUrl: string
  protected _backendApiBaseUrl: string
  protected _userAgent: string
  protected _headers: Record<string, string>
  protected _user: types.User | null = null

  // Stores access tokens for `accessTokenTTL` milliseconds before needing to refresh
  protected _accessTokenCache: ExpiryMap<string, string>

  /**
   * Creates a new client wrapper around the unofficial ChatGPT REST API.
   *
   * Note that your IP address and `userAgent` must match the same values that you used
   * to obtain your `clearanceToken`.
   *
   * @param opts.sessionToken = **Required** OpenAI session token which can be found in a valid session's cookies (see readme for instructions)
   * @param opts.clearanceToken = **Required** Cloudflare `cf_clearance` cookie value (see readme for instructions)
   * @param apiBaseUrl - Optional override; the base URL for ChatGPT webapp's API (`/api`)
   * @param backendApiBaseUrl - Optional override; the base URL for the ChatGPT backend API (`/backend-api`)
   * @param userAgent - Optional override; the `user-agent` header to use with ChatGPT requests
   * @param accessTokenTTL - Optional override; how long in milliseconds access tokens should last before being forcefully refreshed
   * @param accessToken - Optional default access token if you already have a valid one generated
   * @param heaaders - Optional additional HTTP headers to be added to each `fetch` request
   * @param debug - Optional enables logging debugging into to stdout
   */
  constructor(opts: {
    sessionToken: string

    clearanceToken: string

    /** @defaultValue `true` **/
    markdown?: boolean

    /** @defaultValue `'https://chat.openai.com/api'` **/
    apiBaseUrl?: string

    /** @defaultValue `'https://chat.openai.com/backend-api'` **/
    backendApiBaseUrl?: string

    /** @defaultValue `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'` **/
    userAgent?: string

    /** @defaultValue 1 hour **/
    accessTokenTTL?: number

    /** @defaultValue `undefined` **/
    accessToken?: string

    /** @defaultValue `undefined` **/
    headers?: Record<string, string>

    /** @defaultValue `false` **/
    debug?: boolean
  }) {
    super()

    const {
      sessionToken,
      clearanceToken,
      markdown = true,
      apiBaseUrl = 'https://chat.openai.com/api',
      backendApiBaseUrl = 'https://chat.openai.com/backend-api',
      userAgent = USER_AGENT,
      accessTokenTTL = 60 * 60000, // 1 hour
      accessToken,
      headers,
      debug = false
    } = opts

    this._sessionToken = sessionToken
    this._clearanceToken = clearanceToken
    this._markdown = !!markdown
    this._debug = !!debug
    this._apiBaseUrl = apiBaseUrl
    this._backendApiBaseUrl = backendApiBaseUrl
    this._userAgent = userAgent
    this._headers = {
      'user-agent': this._userAgent,
      'x-openai-assistant-app-id': '',
      'accept-language': 'en-US,en;q=0.9',
      'accept-encoding': 'gzip, deflate, br',
      origin: 'https://chat.openai.com',
      referer: 'https://chat.openai.com/chat',
      'sec-ch-ua':
        '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      ...headers
    }

    this._accessTokenCache = new ExpiryMap<string, string>(accessTokenTTL)
    if (accessToken) {
      this._accessTokenCache.set(KEY_ACCESS_TOKEN, accessToken)
    }

    if (!this._sessionToken) {
      const error = new types.ChatGPTError('ChatGPT invalid session token')
      error.statusCode = 401
      throw error
    }

    if (!this._clearanceToken) {
      const error = new types.ChatGPTError('ChatGPT invalid clearance token')
      error.statusCode = 401
      throw error
    }
  }

  /**
   * Gets the currently signed-in user, if authenticated, `null` otherwise.
   */
  get user() {
    return this._user
  }

  /** Gets the current session token. */
  get sessionToken() {
    return this._sessionToken
  }

  /** Gets the current Cloudflare clearance token (`cf_clearance` cookie value). */
  get clearanceToken() {
    return this._clearanceToken
  }

  /** Gets the current user agent. */
  get userAgent() {
    return this._userAgent
  }

  /**
   * Refreshes the client's access token which will succeed only if the session
   * is valid.
   */
  override async initSession() {
    await this.refreshSession()
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
   * @param opts.messageId - Optional ID of the message to send (defaults to a random UUID)
   * @param opts.action - Optional ChatGPT `action` (either `next` or `variant`)
   * @param opts.timeoutMs - Optional timeout in milliseconds (defaults to no timeout)
   * @param opts.onProgress - Optional callback which will be invoked every time the partial response is updated
   * @param opts.abortSignal - Optional callback used to abort the underlying `fetch` call using an [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
   *
   * @returns The response from ChatGPT
   */
  override async sendMessage(
    message: string,
    opts: types.SendMessageOptions = {}
  ): Promise<types.ChatResponse> {
    const {
      conversationId,
      parentMessageId = uuidv4(),
      messageId = uuidv4(),
      action = 'next',
      timeoutMs,
      onProgress
    } = opts

    let { abortSignal } = opts

    let abortController: AbortController = null
    if (timeoutMs && !abortSignal) {
      abortController = new AbortController()
      abortSignal = abortController.signal
    }

    const accessToken = await this.refreshSession()

    const body: types.ConversationJSONBody = {
      action,
      messages: [
        {
          id: messageId,
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

    const result: types.ChatResponse = {
      conversationId,
      messageId,
      response: ''
    }

    const responseP = new Promise<types.ChatResponse>((resolve, reject) => {
      const url = `${this._backendApiBaseUrl}/conversation`
      const headers = {
        ...this._headers,
        Authorization: `Bearer ${accessToken}`,
        Accept: 'text/event-stream',
        'Content-Type': 'application/json',
        Cookie: `cf_clearance=${this._clearanceToken}`
      }

      if (this._debug) {
        console.log('POST', url, { body, headers })
      }

      fetchSSE(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: abortSignal,
        onMessage: (data: string) => {
          if (data === '[DONE]') {
            return resolve(result)
          }

          try {
            const convoResponseEvent: types.ConversationResponseEvent =
              JSON.parse(data)
            if (convoResponseEvent.conversation_id) {
              result.conversationId = convoResponseEvent.conversation_id
            }

            if (convoResponseEvent.message?.id) {
              result.messageId = convoResponseEvent.message.id
            }

            const message = convoResponseEvent.message
            // console.log('event', JSON.stringify(convoResponseEvent, null, 2))

            if (message) {
              let text = message?.content?.parts?.[0]

              if (text) {
                if (!this._markdown) {
                  text = markdownToText(text)
                }

                result.response = text

                if (onProgress) {
                  onProgress(result)
                }
              }
            }
          } catch (err) {
            console.warn('fetchSSE onMessage unexpected error', err)
            reject(err)
          }
        }
      }).catch((err) => {
        const errMessageL = err.toString().toLowerCase()

        if (
          result.response &&
          (errMessageL === 'error: typeerror: terminated' ||
            errMessageL === 'typeerror: terminated')
        ) {
          // OpenAI sometimes forcefully terminates the socket from their end before
          // the HTTP request has resolved cleanly. In my testing, these cases tend to
          // happen when OpenAI has already send the last `response`, so we can ignore
          // the `fetch` error in this case.
          return resolve(result)
        } else {
          return reject(err)
        }
      })
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

  async sendModeration(input: string) {
    const accessToken = await this.refreshSession()
    const url = `${this._backendApiBaseUrl}/moderations`
    const headers = {
      ...this._headers,
      Authorization: `Bearer ${accessToken}`,
      Accept: '*/*',
      'Content-Type': 'application/json',
      Cookie: `cf_clearance=${this._clearanceToken}`
    }

    const body: types.ModerationsJSONBody = {
      input,
      model: 'text-moderation-playground'
    }

    if (this._debug) {
      console.log('POST', url, headers, body)
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    }).then((r) => {
      if (!r.ok) {
        const error = new types.ChatGPTError(`${r.status} ${r.statusText}`)
        error.response = r
        error.statusCode = r.status
        error.statusText = r.statusText
        throw error
      }

      return r.json() as any as types.ModerationsJSONResult
    })

    return res
  }

  /**
   * @returns `true` if the client has a valid acces token or `false` if refreshing
   * the token fails.
   */
  override async getIsAuthenticated() {
    try {
      void (await this.refreshSession())
      return true
    } catch (err) {
      return false
    }
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
  override async refreshSession(): Promise<string> {
    const cachedAccessToken = this._accessTokenCache.get(KEY_ACCESS_TOKEN)
    if (cachedAccessToken) {
      return cachedAccessToken
    }

    let response: Response
    try {
      const url = `${this._apiBaseUrl}/auth/session`
      const headers = {
        ...this._headers,
        cookie: `cf_clearance=${this._clearanceToken}; __Secure-next-auth.session-token=${this._sessionToken}`,
        accept: '*/*'
      }

      if (this._debug) {
        console.log('GET', url, headers)
      }

      const res = await fetch(url, {
        headers
      }).then((r) => {
        response = r

        if (!r.ok) {
          const error = new types.ChatGPTError(`${r.status} ${r.statusText}`)
          error.response = r
          error.statusCode = r.status
          error.statusText = r.statusText
          throw error
        }

        return r.json() as any as types.SessionResult
      })

      const accessToken = res?.accessToken

      if (!accessToken) {
        const error = new types.ChatGPTError('Unauthorized')
        error.response = response
        error.statusCode = response?.status
        error.statusText = response?.statusText
        throw error
      }

      const appError = res?.error
      if (appError) {
        if (appError === 'RefreshAccessTokenError') {
          const error = new types.ChatGPTError('session token may have expired')
          error.response = response
          error.statusCode = response?.status
          error.statusText = response?.statusText
          throw error
        } else {
          const error = new types.ChatGPTError(appError)
          error.response = response
          error.statusCode = response?.status
          error.statusText = response?.statusText
          throw error
        }
      }

      if (res.user) {
        this._user = res.user
      }

      this._accessTokenCache.set(KEY_ACCESS_TOKEN, accessToken)
      return accessToken
    } catch (err: any) {
      if (this._debug) {
        console.error(err)
      }

      const error = new types.ChatGPTError(
        `ChatGPT failed to refresh auth token. ${err.toString()}`
      )
      error.response = response
      error.statusCode = response?.status
      error.statusText = response?.statusText
      error.originalError = err
      throw error
    }
  }

  override async closeSession(): Promise<void> {
    this._accessTokenCache.delete(KEY_ACCESS_TOKEN)
  }
}
