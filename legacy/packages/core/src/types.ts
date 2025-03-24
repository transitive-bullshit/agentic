import type { Jsonifiable } from 'type-fest'
import type { z } from 'zod'

import type { AIFunctionSet } from './ai-function-set'
import type { AIFunctionsProvider } from './fns'
import type { Msg } from './message'
import type { AgenticSchema } from './schema'

export type { Msg } from './message'
export type { AgenticSchema } from './schema'
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
   * The type of the function tool. Always `function`.
   */
  type: 'function'

  /**
   * Whether to enable strict schema adherence when generating the function
   * parameters. Currently only supported by OpenAI's
   * [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs).
   */
  strict: boolean
}

export interface AIToolSpec {
  type: 'function'
  function: AIFunctionSpec
}

/**
 * A Zod object schema or a custom schema created from a JSON schema via
 * `createSchema()`.
 */
export type AIFunctionInputSchema = z.ZodObject<any> | AgenticSchema<any>

// eslint-disable-next-line @typescript-eslint/naming-convention
export type inferInput<InputSchema extends AIFunctionInputSchema> =
  InputSchema extends AgenticSchema<any>
    ? InputSchema['_type']
    : InputSchema extends z.ZodTypeAny
      ? z.infer<InputSchema>
      : never

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
export type AIFunctionLike =
  | AIFunctionsProvider
  | AIFunction<AIFunctionInputSchema>
  | AIFunctionSet

/**
 * A function meant to be used with LLM function calling.
 */
export interface AIFunction<
  // TODO
  // InputSchema extends AIFunctionInputSchema = z.ZodObject<any>,
  InputSchema extends AIFunctionInputSchema = AIFunctionInputSchema,
  Output = any
> {
  /**
   * Invokes the underlying AI function `execute` but first validates the input
   * against this function's `inputSchema`. This method is callable and is
   * meant to be passed the raw LLM JSON string or an OpenAI-compatible Message.
   */
  (input: string | Msg): MaybePromise<Output>

  /** The schema for the input object (zod or custom schema). */
  inputSchema: InputSchema

  /** Parse the function arguments from a message. */
  parseInput(input: string | Msg): inferInput<InputSchema>

  /** The JSON schema function spec for the OpenAI API `functions` property. */
  spec: AIFunctionSpec

  /**
   * The underlying function implementation without any arg parsing or validation.
   */
  // TODO: this `any` shouldn't be necessary, but it is for `createAIFunction` results to be assignable to `AIFunctionLike`
  execute: (params: inferInput<InputSchema> | any) => MaybePromise<Output>
}

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
