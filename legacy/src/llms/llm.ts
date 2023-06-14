import { type SetRequired } from 'type-fest'
import { ZodType, z } from 'zod'

import * as types from '@/types'
import { BaseTask } from '@/task'
import { Tokenizer, getTokenizerForModel } from '@/tokenizer'

// TODO: TInput should only be allowed to be void or an object
export abstract class BaseLLM<
  TInput = void,
  TOutput = string,
  TModelParams extends Record<string, any> = Record<string, any>
> extends BaseTask<TInput, TOutput> {
  protected _inputSchema: ZodType<TInput> | undefined
  protected _outputSchema: ZodType<TOutput> | undefined

  protected _provider: string
  protected _model: string
  protected _modelParams: TModelParams | undefined
  protected _examples: types.LLMExample[] | undefined
  protected _tokenizerP?: Promise<Tokenizer | null>

  constructor(
    options: SetRequired<
      types.BaseLLMOptions<TInput, TOutput, TModelParams>,
      'provider' | 'model'
    >
  ) {
    super(options)

    this._inputSchema = options.inputSchema
    this._outputSchema = options.outputSchema

    this._provider = options.provider
    this._model = options.model
    this._modelParams = options.modelParams
    this._examples = options.examples
  }

  // TODO: use polymorphic `this` type to return correct BaseLLM subclass type
  input<U>(inputSchema: ZodType<U>): BaseLLM<U, TOutput, TModelParams> {
    const refinedInstance = this as unknown as BaseLLM<U, TOutput, TModelParams>
    refinedInstance._inputSchema = inputSchema
    return refinedInstance
  }

  // TODO: use polymorphic `this` type to return correct BaseLLM subclass type
  output<U>(outputSchema: ZodType<U>): BaseLLM<TInput, U, TModelParams> {
    const refinedInstance = this as unknown as BaseLLM<TInput, U, TModelParams>
    refinedInstance._outputSchema = outputSchema
    return refinedInstance
  }

  public override get inputSchema(): ZodType<TInput> {
    if (this._inputSchema) {
      return this._inputSchema
    } else {
      // TODO: improve typing
      return z.void() as unknown as ZodType<TInput>
    }
  }

  public override get outputSchema(): ZodType<TOutput> {
    if (this._outputSchema) {
      return this._outputSchema
    } else {
      // TODO: improve typing
      return z.string() as unknown as ZodType<TOutput>
    }
  }

  public override get nameForModel(): string {
    return `${this._provider}_chat`
  }

  public override get nameForHuman(): string {
    return `${this._provider}:chat:${this._model}`
  }

  examples(examples: types.LLMExample[]): this {
    this._examples = examples
    return this
  }

  modelParams(params: Partial<TModelParams>): this {
    // We assume that modelParams does not include nested objects.
    // If it did, we would need to do a deep merge.
    this._modelParams = { ...this._modelParams, ...params } as TModelParams
    return this
  }

  public async getNumTokens(text: string): Promise<number> {
    if (!this._tokenizerP) {
      const model = this._model || 'gpt2'

      this._tokenizerP = getTokenizerForModel(model).catch((err) => {
        console.warn(
          `Failed to initialize tokenizer for model "${model}", falling back to approximate count`,
          err
        )

        return null
      })
    }

    const tokenizer = await this._tokenizerP

    if (tokenizer) {
      return tokenizer.encode(text).length
    }

    // fallback to approximate calculation if tokenizer is not available
    return Math.ceil(text.length / 4)
  }
}
