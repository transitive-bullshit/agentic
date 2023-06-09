import { ZodRawShape, ZodTypeAny } from 'zod'

import * as types from '@/types'
import { Agentic } from '@/agentic'

/**
 * A `Task` is a typed, async function call that may be non-deterministic.
 *
 * Invoking a task is equivalent to sampling from a probability distribution.
 *
 * Examples of tasks include:
 *    - LLM calls
 *    - Chain of LLM calls
 *    - Retrieval task
 *    - API calls
 *    - Native function calls
 *    - Invoking sub-agents
 */
export abstract class BaseTask<
  TInput extends ZodRawShape | ZodTypeAny = ZodTypeAny,
  TOutput extends ZodRawShape | ZodTypeAny = ZodTypeAny
> {
  protected _agentic: Agentic

  protected _timeoutMs?: number
  protected _retryConfig?: types.RetryConfig

  constructor(options: types.BaseTaskOptions) {
    this._agentic = options.agentic
    this._timeoutMs = options.timeoutMs
    this._retryConfig = options.retryConfig
  }

  public get agentic(): Agentic {
    return this._agentic
  }

  public abstract get inputSchema(): TInput
  public abstract get outputSchema(): TOutput

  // TODO
  // public abstract get nameForModel(): string
  // public abstract get nameForHuman(): string

  // public abstract get descForModel(): string
  // public abstract get descForHuman(): string

  public retryConfig(retryConfig: types.RetryConfig) {
    this._retryConfig = retryConfig
    return this
  }

  public async call(
    input?: types.ParsedData<TInput>
  ): Promise<types.ParsedData<TOutput>> {
    const res = await this.callWithMetadata(input)
    return res.result
  }

  public async callWithMetadata(
    input?: types.ParsedData<TInput>
  ): Promise<types.TaskResponse<TOutput>> {
    return this._call(input)
  }

  protected abstract _call(
    input?: types.ParsedData<TInput>
  ): Promise<types.TaskResponse<TOutput>>

  // TODO
  // abstract stream({
  //   input: TInput,
  //   onProgress: types.ProgressFunction
  // }): Promise<TOutput>
}
