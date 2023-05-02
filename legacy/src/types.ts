import * as openai from 'openai-fetch'
import type { ZodType } from 'zod'

export { openai }

export interface BaseLLMOptions<
  TInput = any,
  TOutput = any,
  TModelParams = Record<string, any>
> {
  provider?: string
  model?: string
  modelParams?: TModelParams
  timeoutMs?: number

  input?: ZodType<TInput>
  output?: ZodType<TOutput>
  examples?: LLMExample[]
  retryConfig?: LLMRetryConfig
}

export interface LLMOptions<
  TInput = any,
  TOutput = any,
  TModelParams = Record<string, any>
> extends BaseLLMOptions<TInput, TOutput, TModelParams> {
  promptTemplate?: string
  promptPrefix?: string
  promptSuffix?: string
}

export interface ChatMessage {
  role: 'user' | 'system' | 'assistant' | 'tool'
  content: string
}

export interface ChatModelOptions<
  TInput = any,
  TOutput = any,
  TModelParams = Record<string, any>
> extends BaseLLMOptions<TInput, TOutput, TModelParams> {
  messages: ChatMessage[]
}

export interface LLMExample {
  input: string
  output: string
}

export interface LLMRetryConfig {
  attempts: number
  strategy: string
}
