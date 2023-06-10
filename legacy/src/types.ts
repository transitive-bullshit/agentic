import * as anthropic from '@anthropic-ai/sdk'
import * as openai from 'openai-fetch'
import type { Options as RetryOptions } from 'p-retry'
import {
  SafeParseReturnType,
  ZodObject,
  ZodRawShape,
  ZodTypeAny,
  output,
  z
} from 'zod'

import type { Agentic } from './agentic'

export { openai }
export { anthropic }

export type ParsedData<T extends ZodRawShape | ZodTypeAny> =
  T extends ZodTypeAny
    ? output<T>
    : T extends ZodRawShape
    ? output<ZodObject<T>>
    : never

export type SafeParsedData<T extends ZodRawShape | ZodTypeAny> =
  T extends ZodTypeAny
    ? SafeParseReturnType<z.infer<T>, ParsedData<T>>
    : T extends ZodRawShape
    ? SafeParseReturnType<ZodObject<T>, ParsedData<T>>
    : never

export interface BaseTaskOptions {
  agentic: Agentic

  timeoutMs?: number
  retryConfig?: RetryConfig

  // TODO
  // caching config
  // logging config
  // human feedback config
}

export interface BaseLLMOptions<
  TInput extends ZodRawShape | ZodTypeAny = ZodTypeAny,
  TOutput extends ZodRawShape | ZodTypeAny = z.ZodType<string>,
  TModelParams extends Record<string, any> = Record<string, any>
> extends BaseTaskOptions {
  inputSchema?: TInput
  outputSchema?: TOutput

  provider?: string
  model?: string
  modelParams?: TModelParams
  examples?: LLMExample[]
}

export interface LLMOptions<
  TInput extends ZodRawShape | ZodTypeAny = ZodTypeAny,
  TOutput extends ZodRawShape | ZodTypeAny = z.ZodType<string>,
  TModelParams extends Record<string, any> = Record<string, any>
> extends BaseLLMOptions<TInput, TOutput, TModelParams> {
  promptTemplate?: string
  promptPrefix?: string
  promptSuffix?: string
}

// export type ChatMessageRole = 'user' | 'system' | 'assistant'
export const ChatMessageRoleSchema = z.union([
  z.literal('user'),
  z.literal('system'),
  z.literal('assistant')
])
export type ChatMessageRole = z.infer<typeof ChatMessageRoleSchema>

export interface ChatMessage {
  role: ChatMessageRole
  content: string
  name?: string
}

export interface ChatModelOptions<
  TInput extends ZodRawShape | ZodTypeAny = ZodTypeAny,
  TOutput extends ZodRawShape | ZodTypeAny = z.ZodType<string>,
  TModelParams extends Record<string, any> = Record<string, any>
> extends BaseLLMOptions<TInput, TOutput, TModelParams> {
  messages: ChatMessage[]
}

export interface BaseChatCompletionResponse<
  TChatCompletionResponse extends Record<string, any> = Record<string, any>
> {
  /** The completion message. */
  message: ChatMessage

  /** The raw response from the LLM provider. */
  response: TChatCompletionResponse
}

export interface LLMExample {
  input: string
  output: string
}

export interface RetryConfig extends RetryOptions {
  strategy: string
}

export type TaskError =
  | 'timeout'
  | 'provider'
  | 'validation'
  | 'unknown'
  | string

export interface TaskResponseMetadata extends Record<string, any> {
  // task info
  // - task name
  // - task id

  // config
  input?: any
  stream?: boolean

  // execution info
  success?: boolean
  numRetries?: number
  errorType?: TaskError
  error?: Error
}

export interface LLMTaskResponseMetadata<
  TChatCompletionResponse extends Record<string, any> = Record<string, any>
> extends TaskResponseMetadata {
  messages?: ChatMessage[]
  completion?: TChatCompletionResponse
}

export interface TaskResponse<
  TOutput extends ZodRawShape | ZodTypeAny = z.ZodType<string>,
  TMetadata extends TaskResponseMetadata = TaskResponseMetadata
> {
  result: ParsedData<TOutput>
  metadata: TMetadata
}

export interface TaskCallContext<
  TInput extends ZodRawShape | ZodTypeAny = ZodTypeAny,
  TOutput extends ZodRawShape | ZodTypeAny = z.ZodType<string>,
  TMetadata extends TaskResponseMetadata = TaskResponseMetadata
> {
  input?: ParsedData<TInput>
  retryMessage?: string

  attemptNumber: number
  metadata: Partial<TMetadata>
}

// export type ProgressFunction = (partialResponse: ChatMessage) => void
