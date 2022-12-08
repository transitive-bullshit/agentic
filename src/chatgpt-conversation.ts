import * as types from './types'
import { type ChatGPTAPI } from './chatgpt-api'

/**
 * A conversation wrapper around the ChatGPTAPI. This allows you to send
 * multiple messages to ChatGPT and receive responses, without having to
 * manually pass the conversation ID and parent message ID for each message.
 */
export class ChatGPTConversation {
  api: ChatGPTAPI
  conversationId: string = undefined
  parentMessageId: string = undefined
  previousParentMessageId: string = undefined
  previousMessage: string = undefined

  /**
   * Creates a new conversation wrapper around the ChatGPT API.
   *
   * @param api - The ChatGPT API instance to use
   * @param opts.conversationId - Optional ID of a conversation to continue
   * @param opts.parentMessageId - Optional ID of the previous message in the conversation
   */
  constructor(
    api: ChatGPTAPI,
    opts: { conversationId?: string; parentMessageId?: string } = {}
  ) {
    this.api = api
    this.conversationId = opts.conversationId
    this.parentMessageId = opts.parentMessageId
  }

  /**
   * Sends a message to ChatGPT, waits for the response to resolve, and returns
   * the response.
   *
   * If this is the first message in the conversation, the conversation ID and
   * parent message ID will be automatically set.
   *
   * This allows you to send multiple messages to ChatGPT and receive responses,
   * without having to manually pass the conversation ID and parent message ID
   * for each message.
   *
   * @param message - The prompt message to send
   * @param opts.onProgress - Optional callback which will be invoked every time the partial response is updated
   * @param opts.onConversationResponse - Optional callback which will be invoked every time the partial response is updated with the full conversation response
   * @param opts.abortSignal - Optional callback used to abort the underlying `fetch` call using an [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
   *
   * @returns The response from ChatGPT
   */
  async sendMessage(
    message: string,
    opts: types.SendConversationMessageOptions = {}
  ): Promise<string> {
    const { onConversationResponse, ...rest } = opts

    this.previousMessage = message
    this.previousParentMessageId = this.parentMessageId

    return this.api.sendMessage(message, {
      ...rest,
      conversationId: this.conversationId,
      parentMessageId: this.parentMessageId,
      onConversationResponse: (response) => {
        if (response.conversation_id) {
          this.conversationId = response.conversation_id
        }

        if (response.message?.id) {
          this.parentMessageId = response.message.id
        }

        if (onConversationResponse) {
          return onConversationResponse(response)
        }
      }
    })
  }

  /*
   * Sends the previous message to ChatGPT in previous context, waits for
   * the response to resolve, and returns the response.
   *
   * If there is no previous message, an error will be thrown.
   *
   * This allows you to send the same message to ChatGPT multiple times with the same context
   * and receive different responses, without having to manually repeat them (like Try Again button on the website).
   *
   * @param opts.onProgress - Optional callback which will be invoked every time the partial response is updated
   * @param opts.onConversationResponse - Optional callback which will be invoked every time the partial response is updated with the full conversation response
   * @param opts.abortSignal - Optional callback used to abort the underlying `fetch` call using an [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
   *
   * @returns The response from ChatGPT
   */
  async tryAgain(
    opts: types.SendConversationMessageOptions = {}
  ): Promise<string> {
    const { onConversationResponse, ...rest } = opts

    if (!this.previousMessage || !this.previousParentMessageId) {
      throw new Error(
        'ChatGPT cannot try again: no previously sent message in conversation'
      )
    }

    return this.api.sendMessage(this.previousMessage, {
      ...rest,
      conversationId: this.conversationId,
      parentMessageId: this.previousParentMessageId,
      onConversationResponse: (response) => {
        if (response.conversation_id) {
          this.conversationId = response.conversation_id
        }

        if (response.message?.id) {
          this.parentMessageId = response.message.id
        }

        if (onConversationResponse) {
          return onConversationResponse(response)
        }
      }
    })
  }
}
