import { ZodRawShape, ZodTypeAny, z } from 'zod'

import * as types from './types'

/**
 * A `Task` is a typed, async function call that may be non-deterministic.
 *
 * Examples of tasks include:
 *    - LLM calls with structured input and output
 *    - API calls
 *    - Native function execution
 *    - Invoking sub-agents
 */
export abstract class BaseTaskCallBuilder<
  TInput extends ZodRawShape | ZodTypeAny = ZodTypeAny,
  TOutput extends ZodRawShape | ZodTypeAny = z.ZodTypeAny
> {
  protected _inputSchema: TInput
  protected _outputSchema: TOutput
  protected _timeoutMs: number
  protected _retryConfig: types.RetryConfig

  constructor(options: types.BaseTaskOptions<TInput, TOutput>) {
    this._inputSchema = options.inputSchema
    this._outputSchema = options.outputSchema
    this._timeoutMs = options.timeoutMs
    this._retryConfig = options.retryConfig
  }

  public get inputSchema(): TInput {
    return this._inputSchema
  }

  public get outputSchema(): TOutput {
    return this._outputSchema
  }

  retry(retryConfig: types.RetryConfig) {
    this._retryConfig = retryConfig
    return this
  }

  abstract call(
    input?: types.ParsedData<TInput>
  ): Promise<types.ParsedData<TOutput>>

  // TODO
  // abstract stream({
  //   input: TInput,
  //   onProgress: types.ProgressFunction
  // }): Promise<TOutput>
}
