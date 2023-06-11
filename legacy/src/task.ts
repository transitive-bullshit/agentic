import pRetry, { FailedAttemptError } from 'p-retry'
import { ZodRawShape, ZodTypeAny, z } from 'zod'

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
    if (this.inputSchema) {
      const inputSchema =
        this.inputSchema instanceof z.ZodType
          ? this.inputSchema
          : z.object(this.inputSchema)

      const safeInput = inputSchema.safeParse(input)

      if (!safeInput.success) {
        throw new Error(`Invalid input: ${safeInput.error.message}`)
      }

      input = safeInput.data
    }

    const ctx: types.TaskCallContext<TInput> = {
      input,
      attemptNumber: 0,
      metadata: {}
    }

    const result = await pRetry(() => this._call(ctx), {
      ...this._retryConfig,
      onFailedAttempt: async (err: FailedAttemptError) => {
        if (this._retryConfig.onFailedAttempt) {
          await Promise.resolve(this._retryConfig.onFailedAttempt(err))
        }

        ctx.attemptNumber = err.attemptNumber + 1

        if (err instanceof errors.ZodOutputValidationError) {
          ctx.retryMessage = err.message
        } else if (err instanceof errors.OutputValidationError) {
          ctx.retryMessage = err.message
        } else {
          throw err
        }
      }
    })

    return {
      result,
      metadata: ctx.metadata
    }
  }

  protected abstract _call(
    ctx: types.TaskCallContext<TInput>
  ): Promise<types.ParsedData<TOutput>>

  // TODO
  // abstract stream({
  //   input: TInput,
  //   onProgress: types.ProgressFunction
  // }): Promise<TOutput>
}
