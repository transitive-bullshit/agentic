import * as anthropic from '@anthropic-ai/sdk'
import * as openai from 'openai-fetch'
import ky from 'ky'
import type { CacheStorage } from 'p-memoize'
import type { Options as RetryOptions } from 'p-retry'
import type { JsonObject, Jsonifiable } from 'type-fest'
import { SafeParseReturnType, ZodType, ZodTypeAny, output, z } from 'zod'

import type { Agentic } from './agentic'
import { SKIP_HOOKS } from './constants'
import type {
  FeedbackTypeToMetadata,
  HumanFeedbackType
} from './human-feedback'
import type { Logger } from './logger'
import type { BaseTask } from './task'

export { anthropic, openai }

export type { Jsonifiable, Logger }
export type KyInstance = typeof ky

export type JsonifiableObject =
  | { [Key in string]?: Jsonifiable }
  | { toJSON: () => Jsonifiable }

export type TaskInput = void | JsonifiableObject
export type TaskOutput = Jsonifiable

export type ParsedData<T extends ZodTypeAny> = T extends ZodTypeAny
  ? output<T>
  : never

export type SafeParsedData<T extends ZodTypeAny> = T extends ZodTypeAny
  ? SafeParseReturnType<z.infer<T>, ParsedData<T>>
  : never

export interface BaseTaskOptions {
  agentic?: Agentic

  timeoutMs?: number
  retryConfig?: RetryConfig
  cacheConfig?: CacheConfig<any, any>
  id?: string

  // TODO
  // caching config
  // logging config
  // human feedback config
}

export interface BaseLLMOptions<
  TInput extends TaskInput = void,
  TOutput extends TaskOutput = string,
  TModelParams extends Record<string, any> = Record<string, any>
> extends BaseTaskOptions {
  inputSchema?: ZodType<TInput>
  outputSchema?: ZodType<TOutput>

  cacheConfig?: CacheConfig<TInput, TOutput>

  provider?: string
  model?: string
  modelParams?: TModelParams
  examples?: LLMExample[]
}

export interface LLMOptions<
  TInput extends TaskInput = void,
  TOutput extends TaskOutput = string,
  TModelParams extends Record<string, any> = Record<string, any>
> extends BaseLLMOptions<TInput, TOutput, TModelParams> {
  promptTemplate?: string
  promptPrefix?: string
  promptSuffix?: string
}

export type ChatMessage = openai.ChatMessage
export type ChatMessageRole = openai.ChatMessageRole

export type ChatMessageContent<TInput extends TaskInput = void> =
  | string
  | ((input: TInput | any) => string)

export type ChatMessageInput<TInput extends TaskInput = void> =
  | ChatMessage
  | {
      role: ChatMessageRole
      name?: string
      function_call?: any
      content: ChatMessageContent<TInput>
    }

export type OpenAIChatCompletionParamsInput<TInput extends TaskInput = void> =
  Omit<openai.ChatCompletionParams, 'messages'> & {
    messages: ChatMessageInput<TInput>[]
  }

export interface ChatModelOptions<
  TInput extends TaskInput = void,
  TOutput extends TaskOutput = string,
  TModelParams extends Record<string, any> = Record<string, any>
> extends BaseLLMOptions<TInput, TOutput, TModelParams> {
  messages: ChatMessageInput<TInput>[]
  tools?: BaseTask<any, any>[]
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
  strategy?: string
}

export type MaybePromise<T> = T | Promise<T>
export type CacheStatus = 'miss' | 'hit'
export type CacheStrategy = 'default' | 'none'

export interface CacheConfig<
  TInput extends TaskInput,
  TOutput extends TaskOutput,
  TCacheKey = any
> {
  cacheStrategy?: CacheStrategy
  cacheKey?: (input: TInput) => MaybePromise<TCacheKey | undefined>
  cache?: CacheStorage<TCacheKey, TOutput> | false
}

export interface TaskResponseMetadata extends Record<string, any> {
  // task info
  taskName: string
  taskId: string
  parentTaskId?: string

  // execution info
  success?: boolean
  error?: Error
  numRetries?: number
  callId?: string
  parentCallId?: string
  cacheStatus?: CacheStatus

  // human feedback info
  feedback?: FeedbackTypeToMetadata<HumanFeedbackType>
}

export interface LLMTaskResponseMetadata<
  TChatCompletionResponse extends Record<string, any> = Record<string, any>
> extends TaskResponseMetadata {
  completion?: TChatCompletionResponse
}

export interface TaskResponse<
  TOutput extends TaskOutput = string,
  TMetadata extends TaskResponseMetadata = TaskResponseMetadata
> {
  result: TOutput
  metadata: TMetadata
}

export interface TaskCallContext<
  TInput extends TaskInput = void,
  TMetadata extends TaskResponseMetadata = TaskResponseMetadata
> {
  input: TInput
  retryMessage?: string

  attemptNumber: number
  metadata: TMetadata
}

export type IDGeneratorFunction = () => string

export interface SerializedTask extends JsonObject {
  _taskName: string
}

export declare class CancelablePromise<T> extends Promise<T> {
  cancel: () => void
}

// export type ProgressFunction = (partialResponse: ChatMessage) => void

export type TaskBeforeCallHook<
  TInput extends TaskInput = void,
  TOutput extends TaskOutput = string
> = (
  ctx: TaskCallContext<TInput>
) =>
  | void
  | TOutput
  | typeof SKIP_HOOKS
  | Promise<void | TOutput | typeof SKIP_HOOKS>

export type TaskAfterCallHook<
  TInput extends TaskInput = void,
  TOutput extends TaskOutput = string
> = (
  output: TOutput,
  ctx: TaskCallContext<TInput>
) =>
  | void
  | TOutput
  | typeof SKIP_HOOKS
  | Promise<void | typeof SKIP_HOOKS | TOutput>
