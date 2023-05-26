import { ZodRawShape, ZodTypeAny, z } from 'zod'

import * as types from './types'

export abstract class BaseTaskCallBuilder<
  TInput extends ZodRawShape | ZodTypeAny = ZodTypeAny,
  TOutput extends ZodRawShape | ZodTypeAny = z.ZodTypeAny
> {
  protected _options: types.BaseTaskOptions<TInput, TOutput>

  constructor(options: types.BaseTaskOptions<TInput, TOutput>) {
    this._options = options
  }

  input<U extends ZodRawShape | ZodTypeAny = TInput>(
    inputSchema: U
  ): BaseTaskCallBuilder<U, TOutput> {
    ;(this as unknown as BaseTaskCallBuilder<U, TOutput>)._options.input =
      inputSchema
    return this as unknown as BaseTaskCallBuilder<U, TOutput>
  }

  output<U extends ZodRawShape | ZodTypeAny = TOutput>(
    outputSchema: U
  ): BaseTaskCallBuilder<TInput, U> {
    ;(this as unknown as BaseTaskCallBuilder<TInput, U>)._options.output =
      outputSchema
    return this as unknown as BaseTaskCallBuilder<TInput, U>
  }

  retry(retryConfig: types.RetryConfig) {
    this._options.retryConfig = retryConfig
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
