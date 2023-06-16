import pRetry, { FailedAttemptError } from 'p-retry'
import { ZodType } from 'zod'

import * as errors from './errors'
import * as types from './types'
import type { Agentic } from './agentic'
import { defaultIDGeneratorFn, isValidTaskIdentifier } from './utils'

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
  TInput extends types.TaskInput = void,
  TOutput extends types.TaskOutput = string
> {
  protected _agentic: Agentic
  protected _id: string

  protected _timeoutMs?: number
  protected _retryConfig: types.RetryConfig

  constructor(options: types.BaseTaskOptions = {}) {
    this._agentic = options.agentic ?? globalThis.__agentic?.deref()

    this._timeoutMs = options.timeoutMs
    this._retryConfig = options.retryConfig ?? {
      retries: 3,
      strategy: 'default'
    }

    this._id =
      options.id ?? this._agentic?.idGeneratorFn() ?? defaultIDGeneratorFn()
  }

  public get agentic(): Agentic {
    return this._agentic
  }

  public set agentic(agentic: Agentic) {
    this._agentic = agentic
  }

  public get id(): string {
    return this._id
  }

  protected get _logger(): types.Logger {
    return this._agentic.logger
  }

  public abstract get inputSchema(): ZodType<TInput>
  public abstract get outputSchema(): ZodType<TOutput>

  public get nameForModel(): string {
    const name = this.constructor.name
    return name[0].toLowerCase() + name.slice(1)
  }

  public get nameForHuman(): string {
    return this.constructor.name
  }

  public get descForModel(): string {
    return ''
  }

  public validate() {
    if (!this._agentic) {
      throw new Error(
        `Task "${this.nameForHuman}" is missing a required "agentic" instance`
      )
    }

    const nameForModel = this.nameForModel
    if (!isValidTaskIdentifier(nameForModel)) {
      throw new Error(`Task field nameForModel "${nameForModel}" is invalid`)
    }
  }

  // TODO: is this really necessary?
  public clone(): BaseTask<TInput, TOutput> {
    // TODO: override in subclass if needed
    throw new Error(`clone not implemented for task "${this.nameForModel}"`)
  }

  public retryConfig(retryConfig: types.RetryConfig): this {
    this._retryConfig = retryConfig
    return this
  }

  /**
   * Calls this task with the given `input` and returns the result only.
   */
  public async call(input?: TInput): Promise<TOutput> {
    const res = await this.callWithMetadata(input)
    return res.result
  }

  /**
   * Calls this task with the given `input` and returns the result along with metadata.
   */
  public async callWithMetadata(
    input?: TInput
  ): Promise<types.TaskResponse<TOutput>> {
    this.validate()

    this._logger.info({ input }, `Task call "${this.nameForHuman}"`)

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
        taskName: this.nameForModel,
        taskId: this.id,
        callId: this._agentic!.idGeneratorFn()
      }
    }

    const result = await pRetry(() => this._call(ctx), {
      ...this._retryConfig,
      onFailedAttempt: async (err: FailedAttemptError) => {
        this._logger.warn(
          err,
          `Task error "${this.nameForHuman}" failed attempt ${
            err.attemptNumber
          }${input ? ': ' + JSON.stringify(input) : ''}`
        )

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

  /**
   * Subclasses must implement the core `_call` logic for this task.
   */
  protected abstract _call(ctx: types.TaskCallContext<TInput>): Promise<TOutput>

  // TODO
  // abstract stream({
  //   input: TInput,
  //   onProgress: types.ProgressFunction
  // }): Promise<TOutput>
}
