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
  name: string
  description: string
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

export type AIFunctionLike = AIFunctionsProvider | AIFunction | AIFunctionSet

/**
 * A function meant to be used with LLM function calling.
 */
export interface AIFunction<
  InputSchema extends z.ZodObject<any> = z.ZodObject<any>,
  Return = any
> {
  (input: string | Msg): MaybePromise<Return>

  /** The Zod schema for the arguments string. */
  inputSchema: InputSchema

  /** Parse the function arguments from a message. */
  parseInput(input: string | Msg): z.infer<InputSchema>

  /** The function spec for the OpenAI API `functions` property. */
  spec: AIFunctionSpec

  /** The underlying function implementation without any arg parsing or validation. */
  impl: (params: z.infer<InputSchema>) => MaybePromise<Return>
}

/**
 * A tool meant to be used with LLM function calling.
 */
export interface AITool<
  InputSchema extends z.ZodObject<any> = z.ZodObject<any>,
  Return = any
> {
  function: AIFunction<InputSchema, Return>

  /** The tool spec for the OpenAI API `tools` property. */
  spec: AIToolSpec
}
