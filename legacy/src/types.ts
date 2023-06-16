import * as openai from '@agentic/openai-fetch'
import * as anthropic from '@anthropic-ai/sdk'
import ky from 'ky'
import type { Options as RetryOptions } from 'p-retry'
import type { JsonObject, Jsonifiable } from 'type-fest'
import { SafeParseReturnType, ZodType, ZodTypeAny, output, z } from 'zod'

import type { Agentic } from './agentic'
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

export interface ChatModelOptions<
  TInput extends TaskInput = void,
  TOutput extends TaskOutput = string,
  TModelParams extends Record<string, any> = Record<string, any>
> extends BaseLLMOptions<TInput, TOutput, TModelParams> {
  messages: ChatMessage[]
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

export interface TaskResponseMetadata extends Record<string, any> {
  // task info
  taskName: string
  taskId: string

  // execution info
  success?: boolean
  error?: Error
  numRetries?: number
  callId?: string

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
  input?: TInput
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
