import * as types from './types'

export abstract class AChatGPTAPI {
  /**
   * Performs any async initialization work required to ensure that this API is
   * properly authenticated.
   *
   * @throws An error if the session failed to initialize properly.
   */
  abstract initSession(): Promise<void>

  /**
   * Sends a message to ChatGPT, waits for the response to resolve, and returns
   * the response.
   *
   * If you want to receive a stream of partial responses, use `opts.onProgress`.
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
   * @returns The response from ChatGPT, including `conversationId`, `messageId`, and
   * the `response` text.
   */
  abstract sendMessage(
    message: string,
    opts?: types.SendMessageOptions
  ): Promise<types.ChatResponse>

  /**
   * @returns `true` if the client is authenticated with a valid session or `false`
   * otherwise.
   */
  abstract getIsAuthenticated(): Promise<boolean>

  /**
   * Refreshes the current ChatGPT session.
   *
   * Useful for bypassing 403 errors when Cloudflare clearance tokens expire.
   *
   * @returns Access credentials for the new session.
   * @throws An error if it fails.
   */
  abstract refreshSession(): Promise<any>

  /**
   * Closes the current ChatGPT session and starts a new one.
   *
   * Useful for bypassing 401 errors when sessions expire.
   *
   * @returns Access credentials for the new session.
   * @throws An error if it fails.
   */
  async resetSession(): Promise<any> {
    await this.closeSession()
    return this.initSession()
  }

  /**
   * Closes the active session.
   *
   * @throws An error if it fails.
   */
  abstract closeSession(): Promise<void>
}
