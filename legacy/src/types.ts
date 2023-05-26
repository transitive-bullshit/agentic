import * as openai from 'openai-fetch'
import {
  SafeParseReturnType,
  ZodObject,
  ZodRawShape,
  ZodTypeAny,
  output,
  z
} from 'zod'

export { openai }

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

export interface BaseTaskOptions<
  TInput extends ZodRawShape | ZodTypeAny = ZodTypeAny,
  TOutput extends ZodRawShape | ZodTypeAny = z.ZodType<string>
> {
  input?: TInput
  output?: TOutput

  timeoutMs?: number
  retryConfig?: RetryConfig

  // TODO
  // caching config
  // logging config
}

export interface BaseLLMOptions<
  TInput extends ZodRawShape | ZodTypeAny = ZodTypeAny,
  TOutput extends ZodRawShape | ZodTypeAny = z.ZodType<string>,
  TModelParams extends Record<string, any> = Record<string, any>
> extends BaseTaskOptions<TInput, TOutput> {
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

export type ChatMessageRole = 'user' | 'system' | 'assistant'

export interface ChatMessage {
  role: ChatMessageRole
  content: string
}

export interface ChatModelOptions<
  TInput extends ZodRawShape | ZodTypeAny = ZodTypeAny,
  TOutput extends ZodRawShape | ZodTypeAny = z.ZodType<string>,
  TModelParams extends Record<string, any> = Record<string, any>
> extends BaseLLMOptions<TInput, TOutput, TModelParams> {
  messages: ChatMessage[]
}

export interface LLMExample {
  input: string
  output: string
}

export interface RetryConfig {
  attempts: number
  strategy: string
}

// export type ProgressFunction = (partialResponse: ChatMessage) => void
