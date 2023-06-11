import pRetry, { FailedAttemptError } from 'p-retry'
import { ZodTypeAny } from 'zod'

import * as errors from '@/errors'
import * as types from '@/types'
import { Agentic } from '@/agentic'

/**
 * A `Task` is an async function call that may be non-deterministic. It has
 * structured input and structured output. Invoking a task is equivalent to
 * sampling from a probability distribution.
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
  TInput extends ZodTypeAny = ZodTypeAny,
  TOutput extends ZodTypeAny = ZodTypeAny
> {
  protected _agentic: Agentic
  protected _id: string

  protected _timeoutMs?: number
  protected _retryConfig: types.RetryConfig

  constructor(options: types.BaseTaskOptions) {
    this._agentic = options.agentic
    this._timeoutMs = options.timeoutMs
    this._retryConfig = options.retryConfig ?? {
      retries: 3,
      strategy: 'default'
    }
    this._id = options.id ?? this._agentic.idGeneratorFn()
  }

  public get agentic(): Agentic {
    return this._agentic
  }

  public get id(): string {
    return this._id
  }

  public abstract get inputSchema(): TInput
  public abstract get outputSchema(): TOutput

  public abstract get name(): string

  public serialize(): types.SerializedTask {
    return {
      _taskName: this.name
      // inputSchema: this.inputSchema.serialize()
    }
  }

  // public abstract deserialize<
  //   TInput extends ZodTypeAny = ZodTypeAny,
  //   TOutput extends ZodTypeAny = ZodTypeAny
  // >(data: types.SerializedTask): BaseTask<TInput, TOutput>

  // TODO: is this really necessary?
  public clone(): BaseTask<TInput, TOutput> {
    // TODO: override in subclass if needed
    throw new Error(`clone not implemented for task "${this.name}"`)
  }

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
      const safeInput = this.inputSchema.safeParse(input)

      if (!safeInput.success) {
        throw new Error(`Invalid input: ${safeInput.error.message}`)
      }

      input = safeInput.data
    }

    const ctx: types.TaskCallContext<TInput> = {
      input,
      attemptNumber: 0,
      metadata: {
        taskName: this.name,
        taskId: this.id
      }
    }

    const result = await pRetry(() => this._call(ctx), {
      ...this._retryConfig,
      onFailedAttempt: async (err: FailedAttemptError) => {
        if (this._retryConfig.onFailedAttempt) {
          await Promise.resolve(this._retryConfig.onFailedAttempt(err))
        }

        // TODO: log this task error
        ctx.attemptNumber = err.attemptNumber + 1
        ctx.metadata.error = err

        if (err instanceof errors.ZodOutputValidationError) {
          ctx.retryMessage = err.message
        } else if (err instanceof errors.OutputValidationError) {
          ctx.retryMessage = err.message
        } else {
          throw err
        }
      }
    })

    ctx.metadata.success = true
    ctx.metadata.numRetries = ctx.attemptNumber
    ctx.metadata.error = undefined

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
