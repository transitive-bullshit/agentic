import type { Jsonifiable } from 'type-fest'
import type { z } from 'zod'

import type { AIFunctionSet } from './ai-function-set.js'
import type { AIFunctionsProvider } from './fns.js'
import type { Msg } from './message.js'

export type { Msg } from './message.js'
export type { KyInstance } from 'ky'
export type { ThrottledFunction } from 'p-throttle'

export type Nullable<T> = T | null

export type DeepNullable<T> = T extends object
  ? { [K in keyof T]: DeepNullable<T[K]> }
  : Nullable<T>

export type MaybePromise<T> = T | Promise<T>

export type RelaxedJsonifiable = Jsonifiable | Record<string, Jsonifiable>

export interface AIFunctionSpec {
  /** AI Function name. */
  name: string

  /** Description of what the function does. */
  description: string

  /** JSON schema spec of the function's input parameters */
  parameters: Record<string, unknown>
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
  Return = any
> {
  /**
   * Invokes the underlying AI function `impl` but first validates the input
   * against this function's `inputSchema`. This method is callable and is
   * meant to be passed the raw LLM JSON string or an OpenAI-compatible Message.
   */
  (input: string | Msg): MaybePromise<Return>

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
  impl: (params: z.infer<InputSchema> | any) => MaybePromise<Return>
}
