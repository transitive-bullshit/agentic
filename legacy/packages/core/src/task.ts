import { EventEmitter } from 'eventemitter3'
import pRetry, { FailedAttemptError } from 'p-retry'
import QuickLRU from 'quick-lru'
import { ZodType } from 'zod'

import type { Agentic } from './agentic'
import { SKIP_HOOKS } from './constants'
import * as errors from './errors'
import { TaskEventEmitter, TaskStatus } from './events'
import {
  HumanFeedbackMechanismCLI,
  HumanFeedbackOptions,
  HumanFeedbackType
} from './human-feedback'
import * as types from './types'
import { defaultIDGeneratorFn, isValidTaskIdentifier } from './utils'

/**
 * A `Task` is an async function call that may be non-deterministic. It has
 * structured input and structured output. Invoking a task is equivalent to
 * sampling from a probability distribution.
 *
 * Examples of tasks include:
 *    - LLM calls
 *    - Chains of LLM calls
 *    - Retrieval tasks
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
  protected _cacheConfig: types.CacheConfig<TInput, TOutput>
  protected _eventEmitter: TaskEventEmitter<TInput, TOutput>

  protected _preHooks: Array<{
    hook: types.TaskBeforeCallHook<TInput>
    priority: number
  }> = []

  protected _postHooks: Array<{
    hook: types.TaskAfterCallHook<TInput, TOutput>
    priority: number
  }> = []

  constructor(options: types.BaseTaskOptions = {}) {
    this._agentic = options.agentic ?? globalThis.__agentic?.deref()

    this._timeoutMs = options.timeoutMs
    this._retryConfig = options.retryConfig ?? {
      retries: 3,
      strategy: 'default'
    }

    this._cacheConfig = {
      cacheStrategy: 'default',
      cacheKey: (input: TInput) => JSON.stringify(input),
      ...options.cacheConfig
    }

    if (
      this._cacheConfig.cacheStrategy === 'default' &&
      !this._cacheConfig.cache
    ) {
      this._cacheConfig.cache = new QuickLRU<string, TOutput>({ maxSize: 1000 })
    }

    this._id =
      options.id ?? this._agentic?.idGeneratorFn() ?? defaultIDGeneratorFn()

    this._eventEmitter = new TaskEventEmitter<TInput, TOutput>(
      this,
      this._agentic
    )
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

  public get eventEmitter(): EventEmitter {
    return this._eventEmitter
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

  /**
   * Adds a hook to be called before the task is invoked.
   *
   * @param hook - function to be called before the task is invoked
   * @param priority - priority of the hook; higher priority hooks are called first
   */
  public addBeforeCallHook(
    hook: types.TaskBeforeCallHook<TInput>,
    priority = 0
  ): this {
    this._preHooks.push({ hook, priority })
    this._preHooks.sort((a, b) => b.priority - a.priority) // two elements that compare equal will remain in their original order (>= ECMAScript 2019)
    return this
  }

  /**
   * Adds a hook to be called after the task is invoked.
   *
   * @param hook - function to be called after the task is invoked
   * @param priority - priority of the hook; higher priority hooks are called first
   */
  public addAfterCallHook(
    hook: types.TaskAfterCallHook<TInput, TOutput>,
    priority = 0
  ): this {
    this._postHooks.push({ hook, priority })
    this._postHooks.sort((a, b) => b.priority - a.priority)
    return this
  }

  /**
   * Ensures that this task is configured correctly. `validate` will be called
   * automatically before `task.call` or `task.callWithMetadata` are invoked.
   */
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

  /**
   * Adds an after call hook to confirm or refine the output of this task with
   * human feedback.
   */
  public withHumanFeedback<V extends HumanFeedbackType>(
    options: HumanFeedbackOptions<V, TOutput> = {}
  ): this {
    options = Object.assign(
      {
        type: 'confirm',
        abort: false,
        editing: false,
        annotations: false,
        timeoutMs: Number.POSITIVE_INFINITY,
        mechanism: HumanFeedbackMechanismCLI
      },
      this.agentic.humanFeedbackDefaults,
      options
    )

    if (!options.mechanism) {
      throw new Error(
        'No feedback mechanism provided. Please provide a feedback mechanism to use.'
      )
    }

    const feedbackMechanism = new options.mechanism({
      task: this,
      options
    })

    this.addAfterCallHook(async (output, ctx) => {
      const feedback = await feedbackMechanism.interact(output)
      ctx.metadata = { ...ctx.metadata, feedback }
      if (feedback.editedOutput) {
        return feedback.editedOutput
      }

      switch (feedback.type) {
        case 'confirm':
          return output
        case 'select':
          return feedback.chosen
        case 'multiselect':
          return feedback.selected
      }
    })

    return this
  }

  public retryConfig(retryConfig: types.RetryConfig): this {
    this._retryConfig = retryConfig
    return this
  }

  public cacheConfig(cacheConfig: types.CacheConfig<TInput, TOutput>): this {
    this._cacheConfig = cacheConfig
    return this
  }

  /**
   * Calls this task with the given `input` and returns the result only.
   */
  public async call(input: TInput): Promise<TOutput> {
    const res = await this.callWithMetadata(input)
    return res.result
  }

  /**
   * Calls this task with the given `input` and returns the result along with metadata.
   */
  public async callWithMetadata(
    input: TInput,
    parentCtx?: types.TaskCallContext<any>
  ): Promise<types.TaskResponse<TOutput>> {
    this.validate()

    // const title = `${this.nameForModel}(${stringifyForDebugging(input, {
    //   maxLength: 120
    // })})`

    this._logger.info(`Task call "${this.nameForHuman}"`, { input })

    if (this.inputSchema) {
      const safeInput = this.inputSchema.safeParse(input)

      if (!safeInput.success) {
        throw new Error(`Invalid input: ${safeInput.error.message}`)
      }

      input = safeInput.data
    }

    const maybeCacheKey = this._cacheConfig.cache
      ? this._cacheConfig.cacheKey?.(input)
      : undefined
    const cacheKey = maybeCacheKey
      ? await Promise.resolve(maybeCacheKey)
      : undefined

    const ctx: types.TaskCallContext<TInput> = {
      input,
      attemptNumber: 0,
      metadata: {
        taskName: this.nameForModel,
        taskId: this.id,
        callId: this._agentic!.idGeneratorFn(),
        parentTaskId: parentCtx?.metadata.taskId,
        parentCallId: parentCtx?.metadata.callId,
        cacheStatus: 'miss'
      }
    }

    this._eventEmitter.emit(TaskStatus.RUNNING, {
      taskInputs: input,
      ...ctx.metadata
    })

    for (const { hook: preHook } of this._preHooks) {
      const preHookResult = await preHook(ctx)
      if (preHookResult === SKIP_HOOKS) {
        break
      } else if (preHookResult !== undefined) {
        const output = this.outputSchema?.safeParse(preHookResult)
        if (!output?.success) {
          throw new Error(`Invalid preHook output: ${output?.error.message}`)
        }

        ctx.metadata.success = true
        ctx.metadata.numRetries = ctx.attemptNumber
        ctx.metadata.error = undefined

        return {
          result: output.data,
          metadata: ctx.metadata
        }
      }
    }

    if (cacheKey && this._cacheConfig.cache) {
      const cachedValue = await Promise.resolve(
        this._cacheConfig.cache.get(cacheKey)
      )

      if (cachedValue) {
        ctx.metadata.success = true
        ctx.metadata.cacheStatus = 'hit'

        return {
          result: cachedValue,
          metadata: ctx.metadata
        }
      }
    }

    const result = await pRetry(
      async () => {
        let result = await this._call(ctx)

        for (const { hook: postHook } of this._postHooks) {
          const postHookResult = await postHook(result, ctx)
          if (postHookResult === SKIP_HOOKS) {
            break
          } else if (postHookResult !== undefined) {
            result = postHookResult
          }
        }

        return result
      },
      {
        ...this._retryConfig,
        onFailedAttempt: async (err: FailedAttemptError) => {
          this._logger.warn(
            `Task error "${this.nameForHuman}" failed attempt ${err.attemptNumber
            }${input ? ': ' + JSON.stringify(input) : ''}`,
            err
          )

          if (this._retryConfig.onFailedAttempt) {
            await Promise.resolve(this._retryConfig.onFailedAttempt(err))
          }

          // TODO: log this task error
          ctx.attemptNumber = err.attemptNumber + 1
          ctx.metadata.error = err

          if (err instanceof errors.ZodOutputValidationError) {
            ctx.retryMessage = err.message
            return
          } else if (err instanceof errors.OutputValidationError) {
            ctx.retryMessage = err.message
            return
          } else if (err instanceof errors.HumanFeedbackDeclineError) {
            ctx.retryMessage = err.message
            return
          } else if (
            err instanceof errors.KyTimeoutError ||
            err instanceof errors.TimeoutError ||
            (err as any).name === 'TimeoutError'
          ) {
            // TODO
            return
          } else if ((err.cause as any)?.code === 'UND_ERR_HEADERS_TIMEOUT') {
            // TODO: This is a pretty common OpenAI error, and I think it either has
            // to do with OpenAI's servers being flaky or the combination of Node.js
            // `undici` and OpenAI's HTTP requests. Either way, let's just retry the
            // task for now.
            return
          } else {
            throw err
          }
        }
      }
    )

    ctx.metadata.success = true
    ctx.metadata.numRetries = ctx.attemptNumber
    ctx.metadata.error = undefined

    if (cacheKey && this._cacheConfig.cache) {
      await Promise.resolve(this._cacheConfig.cache.set(cacheKey, result))
    }

    // ctx.tracker.setOutput(stringifyForDebugging(result, { maxLength: 100 }))

    this._eventEmitter.emit(TaskStatus.SUCCEEDED, {
      taskInputs: input,
      taskOutput: result,
      ...ctx.metadata
    })

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
