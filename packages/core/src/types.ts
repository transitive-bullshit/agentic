import type { Jsonifiable, SetOptional, Simplify } from 'type-fest'
import type { z } from 'zod'

import type { AIFunctionSet } from './ai-function-set'
import type { AIFunctionsProvider } from './fns'
import type { LegacyMsg, Msg } from './message'

export type { Msg } from './message'
export type { Schema } from './schema'
export type { KyInstance } from 'ky'
export type { ThrottledFunction } from 'p-throttle'
export type { SetOptional, SetRequired, Simplify } from 'type-fest'

export type Nullable<T> = T | null

export type DeepNullable<T> = T extends object
  ? { [K in keyof T]: DeepNullable<T[K]> }
  : Nullable<T>

export type MaybePromise<T> = T | Promise<T>

// TODO: use a more specific type
export type JSONSchema = Record<string, unknown>

export type RelaxedJsonifiable = Jsonifiable | Record<string, unknown>

export interface AIFunctionSpec {
  /** AI Function name. */
  name: string

  /** Description of what the function does. */
  description: string

  /** JSON schema spec of the function's input parameters */
  parameters: JSONSchema

  /**
   * Whether to enable strict schema adherence when generating the function
   * parameters. Currently only supported by OpenAI's
   * [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs).
   */
  strict?: boolean
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
  response_format?:
    | {
        type: 'text'
      }
    | {
        type: 'json_object'
      }
    | {
        type: 'json_schema'
        json_schema: ResponseFormatJSONSchema
      }
  seed?: number
  stop?: string | null | Array<string>
  temperature?: number
  top_logprobs?: number
  top_p?: number
  user?: string
}

export type LegacyChatParams = Simplify<
  Omit<ChatParams, 'messages'> & { messages: LegacyMsg[] }
>

export interface ResponseFormatJSONSchema {
  /**
   * The name of the response format. Must be a-z, A-Z, 0-9, or contain
   * underscores and dashes, with a maximum length of 64.
   */
  name: string

  /**
   * A description of what the response format is for, used by the model to
   * determine how to respond in the format.
   */
  description?: string

  /**
   * The schema for the response format, described as a JSON Schema object.
   */
  schema?: JSONSchema

  /**
   * Whether to enable strict schema adherence when generating the output. If
   * set to true, the model will always follow the exact schema defined in the
   * `schema` field. Only a subset of JSON Schema is supported when `strict`
   * is `true`. Currently only supported by OpenAI's
   * [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs).
   */
  strict?: boolean
}

/**
 * OpenAI has changed some of their types, so instead of trying to support all
 * possible types, for these params, just relax them for now.
 */
export type RelaxedChatParams = Simplify<
  Omit<ChatParams, 'messages' | 'response_format'> & {
    messages: any[]
    response_format?: any
  }
>

/** An OpenAI-compatible chat completions API */
export type ChatFn = (
  params: Simplify<SetOptional<RelaxedChatParams, 'model'>>
) => Promise<{ message: Msg | LegacyMsg }>

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

export type ParseFn<TData> = (value: unknown) => TData
export type SafeParseFn<TData> = (value: unknown) => SafeParseResult<TData>
