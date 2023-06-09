import pRetry from 'p-retry'
import { ZodRawShape, ZodTypeAny } from 'zod'

import * as errors from '@/errors'
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
  protected _retryConfig: types.RetryConfig

  constructor(options: types.BaseTaskOptions) {
    this._agentic = options.agentic
    this._timeoutMs = options.timeoutMs
    this._retryConfig = options.retryConfig ?? {
      retries: 3,
      strategy: 'default'
    }
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
    const metadata: types.TaskResponseMetadata = {
      input,
      numRetries: 0
    }

    do {
      try {
        const response = await this._call(input)
        return response
      } catch (err: any) {
        if (err instanceof errors.ZodOutputValidationError) {
          // TODO
        } else {
          throw err
        }
      }

      // TODO: handle errors, retry logic, and self-healing
      metadata.numRetries = (metadata.numRetries ?? 0) + 1
      if (metadata.numRetries > this._retryConfig.retries) {
      }

      // eslint-disable-next-line no-constant-condition
    } while (true)
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
