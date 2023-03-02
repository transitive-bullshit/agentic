import type * as openai from 'openai'

export { openai }

export type Role = 'user' | 'assistant' | 'system'

export type FetchFn = typeof fetch

export type SendMessageOptions = {
  /** The name of a user in a multi-user chat. */
  name?: string
  parentMessageId?: string
  messageId?: string
  stream?: boolean
  systemMessage?: string
  timeoutMs?: number
  onProgress?: (partialResponse: ChatMessage) => void
  abortSignal?: AbortSignal
}

export type MessageActionType = 'next' | 'variant'

export type SendMessageBrowserOptions = {
  conversationId?: string
  parentMessageId?: string
  messageId?: string
  action?: MessageActionType
  timeoutMs?: number
  onProgress?: (partialResponse: ChatMessage) => void
  abortSignal?: AbortSignal
}

export interface ChatMessage {
  id: string
  text: string
  role: Role
  name?: string
  delta?: string
  detail?: any

  // relevant for both ChatGPTAPI and ChatGPTUnofficialProxyAPI
  parentMessageId?: string
  // only relevant for ChatGPTUnofficialProxyAPI
  conversationId?: string
}

export class ChatGPTError extends Error {
  statusCode?: number
  statusText?: string
  isFinal?: boolean
  accountId?: string
}

/** Returns a chat message from a store by it's ID (or null if not found). */
export type GetMessageByIdFunction = (id: string) => Promise<ChatMessage>

/** Upserts a chat message to a store. */
export type UpsertMessageFunction = (message: ChatMessage) => Promise<void>

/**
 * https://chat.openapi.com/backend-api/conversation
 */
export type ConversationJSONBody = {
  /**
   * The action to take
   */
  action: string

  /**
   * The ID of the conversation
   */
  conversation_id?: string

  /**
   * Prompts to provide
   */
  messages: Prompt[]

  /**
   * The model to use
   */
  model: string

  /**
   * The parent message ID
   */
  parent_message_id: string
}

export type Prompt = {
  /**
   * The content of the prompt
   */
  content: PromptContent

  /**
   * The ID of the prompt
   */
  id: string

  /**
   * The role played in the prompt
   */
  role: Role
}

export type ContentType = 'text'

export type PromptContent = {
  /**
   * The content type of the prompt
   */
  content_type: ContentType

  /**
   * The parts to the prompt
   */
  parts: string[]
}

export type ConversationResponseEvent = {
  message?: Message
  conversation_id?: string
  error?: string | null
}

export type Message = {
  id: string
  content: MessageContent
  role: Role
  user: string | null
  create_time: string | null
  update_time: string | null
  end_turn: null
  weight: number
  recipient: string
  metadata: MessageMetadata
}

export type MessageContent = {
  content_type: string
  parts: string[]
}

export type MessageMetadata = any

export interface CreateChatCompletionDeltaResponse {
  id: string
  object: 'chat.completion.chunk'
  created: number
  model: string
  choices: [
    {
      delta: {
        role: Role
        content?: string
      }
      index: number
      finish_reason: string | null
    }
  ]
}
