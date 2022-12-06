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
   * @param opts.onProgress - Optional listener which will be called every time the partial response is updated
   * @param opts.onConversationResponse - Optional listener which will be called every time a conversation response is received
   * @returns The response from ChatGPT
   */
  async sendMessage(
    message: string,
    opts: {
      onProgress?: (partialResponse: string) => void
      onConversationResponse?: (
        response: types.ConversationResponseEvent
      ) => void
    } = {}
  ): Promise<string> {
    const { onProgress, onConversationResponse } = opts

    return this.api.sendMessage(message, {
      conversationId: this.conversationId,
      parentMessageId: this.parentMessageId,
      onProgress,
      onConversationResponse: (response) => {
        this.conversationId = response.conversation_id
        this.parentMessageId = response.message.id

        if (onConversationResponse) {
          return onConversationResponse(response)
        }
      }
    })
  }
}
