import { z } from 'zod'

// export type ChatMessageRole = 'user' | 'system' | 'assistant'
export const ChatMessageRoleSchema = z.union([
  z.literal('user'),
  z.literal('system'),
  z.literal('assistant'),
  z.literal('function')
])
export type ChatMessageRole = z.infer<typeof ChatMessageRoleSchema>

export interface ChatMessageBase {
  role: ChatMessageRole
  content: string
  name?: string
}

export interface ChatMessageUser extends ChatMessageBase {
  role: 'user'
}

export interface ChatMessageSystem extends ChatMessageBase {
  role: 'system'
}

export interface ChatMessageAssistant extends ChatMessageBase {
  role: 'assistant'
}

export interface ChatMessageFunctionCall extends ChatMessageBase {
  role: 'assistant'
  function_call: FunctionCall
}

export interface FunctionCall {
  name: string
  arguments: string
}

export interface ChatMessageFunction extends ChatMessageBase {
  role: 'function'
  name: string
}

export type ChatMessage =
  | ChatMessageUser
  | ChatMessageSystem
  | ChatMessageAssistant
  | ChatMessageFunctionCall
  | ChatMessageFunction

export interface FunctionDefinition {
  /**
   * The name of the function to be called. Must be a-z, A-Z, 0-9, or contain underscores and dashes, with a maximum length of 64.
   */
  name: string

  /**
   * The description of what the function does.
   */
  description?: string

  /**
   * The parameters the function accepts, described as a JSON Schema object. See the [guide](/docs/guides/gpt/function-calling) for examples, and the [JSON Schema reference](https://json-schema.org/understanding-json-schema/) for documentation about the format.
   */
  parameters?: { [key: string]: any }
}

export type FunctionCallOptions =
  | 'none'
  | 'auto'
  | {
      name: string
    }
