export type Role = 'user' | 'assistant'

export type SendMessageOptions = {
  conversationId?: string
  parentMessageId?: string
  messageId?: string
  stream?: boolean
  promptPrefix?: string
  promptSuffix?: string
  timeoutMs?: number
  onProgress?: (partialResponse: ChatMessage) => void
  abortSignal?: AbortSignal
}

export interface ChatMessage {
  id: string
  text: string
  role: Role

  parentMessageId?: string
  conversationId?: string
}

export type GetMessageByIdFunction = (id: string) => Promise<ChatMessage>

export class ChatGPTError extends Error {
  statusCode?: number
  statusText?: string
}
