import type { Jsonifiable, SetOptional, SetRequired, Simplify } from 'type-fest'
import type { z } from 'zod'

import type { AIFunctionSet } from './ai-function-set.js'
import type { AIFunctionsProvider } from './fns.js'
import type { Msg } from './message.js'
import type { Schema } from './schema.js'

export type { Msg } from './message.js'
export type { Schema } from './schema.js'
export type { KyInstance } from 'ky'
export type { ThrottledFunction } from 'p-throttle'
export type { Simplify } from 'type-fest'

export type Nullable<T> = T | null

export type DeepNullable<T> = T extends object
  ? { [K in keyof T]: DeepNullable<T[K]> }
  : Nullable<T>

export type MaybePromise<T> = T | Promise<T>

// TODO: use a more specific type
export type JSONSchema = Record<string, unknown>

export type RelaxedJsonifiable =
  | Jsonifiable
  | Record<string, unknown>
  | JSONSchema

export type Context = object

export interface AIFunctionSpec {
  /** AI Function name. */
  name: string

  /** Description of what the function does. */
  description: string

  /** JSON schema spec of the function's input parameters */
  parameters: JSONSchema
}

export interface AIToolSpec {
  type: 'function'
  function: AIFunctionSpec
}

/** The implementation of the function, with arg parsing and validation. */
export type AIFunctionImpl<Return> = Omit<
  (input: string | Msg) => MaybePromise<Return>,
  'name' | 'toString' | 'arguments' | 'caller' | 'prototype' | 'length'
>

/**
 * Flexible type which accepts any AI-function-like object, including:
 *   - `AIFunctionSet` - Sets of AI functions
 *   - `AIFunctionsProvider` - Client classes which expose an `AIFunctionSet`
 *      via the `.functions` property
 *   - `AIFunction` - Individual functions
 */
export type AIFunctionLike = AIFunctionsProvider | AIFunction | AIFunctionSet

/**
 * A function meant to be used with LLM function calling.
 */
export interface AIFunction<
  InputSchema extends z.ZodObject<any> = z.ZodObject<any>,
  Output = any
> {
  /**
   * Invokes the underlying AI function `impl` but first validates the input
   * against this function's `inputSchema`. This method is callable and is
   * meant to be passed the raw LLM JSON string or an OpenAI-compatible Message.
   */
  (input: string | Msg): MaybePromise<Output>

  /** The Zod schema for the input object. */
  inputSchema: InputSchema

  /** Parse the function arguments from a message. */
  parseInput(input: string | Msg): z.infer<InputSchema>

  /** The JSON schema function spec for the OpenAI API `functions` property. */
  spec: AIFunctionSpec

  /**
   * The underlying function implementation without any arg parsing or validation.
   */
  // TODO: this `any` shouldn't be necessary, but it is for `createAIFunction` results to be assignable to `AIFunctionLike`
  impl: (params: z.infer<InputSchema> | any) => MaybePromise<Output>
}

export interface ChatParams {
  messages: Msg[]
  model: string & {}
  functions?: AIFunctionSpec[]
  function_call?: 'none' | 'auto' | { name: string }
  tools?: AIToolSpec[]
  tool_choice?:
    | 'none'
    | 'auto'
    | 'required'
    | { type: 'function'; function: { name: string } }
  parallel_tool_calls?: boolean
  logit_bias?: Record<string, number>
  logprobs?: boolean
  max_tokens?: number
  presence_penalty?: number
  frequency_penalty?: number
  response_format?: { type: 'text' | 'json_object' }
  seed?: number
  stop?: string | null | Array<string>
  temperature?: number
  top_logprobs?: number
  top_p?: number
  user?: string
}

/** An OpenAI-compatible chat completions API */
export type ChatFn = (
  params: Simplify<SetOptional<ChatParams, 'model'>>
) => Promise<{ message: Msg }>

export type AIChainResult = string | Record<string, any>

export type AIChain<Result extends AIChainResult = string> = (
  params?:
    | string
    | Simplify<SetOptional<Omit<ChatParams, 'tools' | 'functions'>, 'model'>>
) => Promise<Result>

export type SafeParseResult<TData> =
  | {
      success: true
      data: TData
    }
  | {
      success: false
      error: string
    }

export type ValidatorFn<TData> = (value: unknown) => SafeParseResult<TData>

export type AIChainParams<Result extends AIChainResult = string> = {
  chatFn: ChatFn
  params?: Simplify<Partial<Omit<ChatParams, 'tools' | 'functions'>>>
  tools?: AIFunctionLike[]
  schema?: z.ZodType<Result> | Schema<Result>
  maxCalls?: number
  maxRetries?: number
  toolCallConcurrency?: number
  injectSchemaIntoSystemMessage?: boolean
}

export type ExtractObjectParams<Result extends AIChainResult = string> =
  Simplify<
    SetRequired<
      Omit<AIChainParams<Result>, 'tools' | 'toolCallConcurrency' | 'params'>,
      'schema'
    > & {
      params: SetRequired<Partial<ChatParams>, 'messages'>
    }
  >
