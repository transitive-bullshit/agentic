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
   * Get the list of currently-active conversations in ChatGPT.
   *
   * @param opts.limit - Amount of conversations to fetch
   * @param opts.offset - By how many conversations to offset the result by
   *
   * @returns The list of currently-active ChatGPT conversations, including the total amount
   */
  abstract getConversations(
    opts?: types.GetConversationsOptions
  ): Promise<types.ConversationsData>

  /**
   * Generate a fitting title for the specified conversation & message, using the ChatGPT API.
   *
   * @param conversationId Conversation ID, where the message was sent
   * @param messageId Message to use to generate the summarized title
   *
   * @throws An error, in case something went wrong
   * @returns The generated conversation title
   */
  abstract generateConversationTitle(
    conversationId: string,
    messageId: string
  ): Promise<string>

  /**
   * Delete the specified conversation from the conversation history.
   *
   * @param id ID of the conversation to delete
   *
   * @throws An error, in case something went wrong
   * @returns Whether the conversation was successfully deleted
   */
  abstract deleteConversation(id?: string): Promise<boolean>

  /**
   * Delete all conversations in the conversation history.
   *
   * @throws An error, in case something went wrong
   * @returns Whether all conversations were successfully deleted
   */
  abstract deleteAllConversations(): Promise<boolean>

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
