import { ZodRawShape, ZodTypeAny, z } from 'zod'

import * as types from './types'
import { BaseTaskCallBuilder } from './task'

export abstract class BaseLLMCallBuilder<
  TInput extends ZodRawShape | ZodTypeAny = ZodTypeAny,
  TOutput extends ZodRawShape | ZodTypeAny = z.ZodType<string>,
  TModelParams extends Record<string, any> = Record<string, any>
> extends BaseTaskCallBuilder<TInput, TOutput> {
  protected _provider: string
  protected _model: string
  protected _modelParams: TModelParams
  protected _examples: types.LLMExample[]

  constructor(options: types.BaseLLMOptions<TInput, TOutput, TModelParams>) {
    super(options)

    this._provider = options.provider
    this._model = options.model
    this._modelParams = options.modelParams
    this._examples = options.examples
  }

  override input<U extends ZodRawShape | ZodTypeAny = TInput>(
    inputSchema: U
  ): BaseLLMCallBuilder<U, TOutput, TModelParams> {
    ;(
      this as unknown as BaseLLMCallBuilder<U, TOutput, TModelParams>
    )._inputSchema = inputSchema
    return this as unknown as BaseLLMCallBuilder<U, TOutput, TModelParams>
  }

  override output<U extends ZodRawShape | ZodTypeAny = TOutput>(
    outputSchema: U
  ): BaseLLMCallBuilder<TInput, U, TModelParams> {
    ;(
      this as unknown as BaseLLMCallBuilder<TInput, U, TModelParams>
    )._outputSchema = outputSchema
    return this as unknown as BaseLLMCallBuilder<TInput, U, TModelParams>
  }

  examples(examples: types.LLMExample[]) {
    this._examples = examples
    return this
  }

  modelParams(params: Partial<TModelParams>) {
    // We assume that modelParams does not include nested objects.
    // If it did, we would need to do a deep merge.
    this._modelParams = Object.assign({}, this._modelParams, params)
    return this
  }

  // TODO
  // abstract stream({
  //   input: TInput,
  //   onProgress: types.ProgressFunction
  // }): Promise<TOutput>
}

export abstract class ChatModelBuilder<
  TInput extends ZodRawShape | ZodTypeAny = ZodTypeAny,
  TOutput extends ZodRawShape | ZodTypeAny = z.ZodType<string>,
  TModelParams extends Record<string, any> = Record<string, any>
> extends BaseLLMCallBuilder<TInput, TOutput, TModelParams> {
  _messages: types.ChatMessage[]

  constructor(options: types.ChatModelOptions<TInput, TOutput, TModelParams>) {
    super(options)

    this._messages = options.messages
  }
}
