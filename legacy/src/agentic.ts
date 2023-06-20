import defaultKy from 'ky'
import { SetOptional } from 'type-fest'

import * as types from './types'
import { DEFAULT_OPENAI_MODEL } from './constants'
import { HumanFeedbackOptions, HumanFeedbackType } from './human-feedback'
import { HumanFeedbackMechanismCLI } from './human-feedback/cli'
import { OpenAIChatCompletion } from './llms/openai'
import { defaultLogger } from './logger'
import { defaultIDGeneratorFn, isFunction, isString } from './utils'

export class Agentic {
  // _taskMap: WeakMap<string, BaseTask<any, any>>
  protected _ky: types.KyInstance
  protected _logger: types.Logger

  protected _openai?: types.openai.OpenAIClient
  protected _anthropic?: types.anthropic.Client

  protected _openaiModelDefaults: Pick<
    types.BaseLLMOptions,
    'provider' | 'model' | 'modelParams' | 'timeoutMs' | 'retryConfig'
  >
  protected _humanFeedbackDefaults: HumanFeedbackOptions<HumanFeedbackType, any>
  protected _idGeneratorFn: types.IDGeneratorFunction
  protected _id: string

  constructor(opts: {
    openai?: types.openai.OpenAIClient
    anthropic?: types.anthropic.Client
    openaiModelDefaults?: Pick<
      types.BaseLLMOptions,
      'provider' | 'model' | 'modelParams' | 'timeoutMs' | 'retryConfig'
    >
    humanFeedbackDefaults?: HumanFeedbackOptions<HumanFeedbackType, any>
    idGeneratorFn?: types.IDGeneratorFunction
    logger?: types.Logger
    ky?: types.KyInstance
  }) {
    // TODO: This is a bit hacky, but we're doing it to have a slightly nicer API
    // for the end developer when creating subclasses of `BaseTask` to use as
    // tools.
    if (!globalThis.__agentic?.deref()) {
      globalThis.__agentic = new WeakRef(this)
    }

    this._openai = opts.openai
    this._anthropic = opts.anthropic

    this._ky = opts.ky ?? defaultKy
    this._logger = opts.logger ?? defaultLogger

    this._openaiModelDefaults = {
      provider: 'openai',
      model: DEFAULT_OPENAI_MODEL,
      modelParams: {},
      timeoutMs: 2 * 60000,
      retryConfig: {
        retries: 2,
        strategy: 'heal',
        ...opts.openaiModelDefaults?.retryConfig
      },
      ...opts.openaiModelDefaults
    }

    // TODO
    // this._anthropicModelDefaults = {}

    this._humanFeedbackDefaults = {
      type: 'confirm',
      abort: false,
      editing: false,
      annotations: false,
      mechanism: HumanFeedbackMechanismCLI,
      ...opts.humanFeedbackDefaults
    }

    this._idGeneratorFn = opts.idGeneratorFn ?? defaultIDGeneratorFn
    this._id = this._idGeneratorFn()
  }

  public get openai(): types.openai.OpenAIClient | undefined {
    return this._openai
  }

  public get anthropic(): types.anthropic.Client | undefined {
    return this._anthropic
  }

  public get ky(): types.KyInstance {
    return this._ky
  }

  public get logger(): types.Logger {
    return this._logger
  }

  public get humanFeedbackDefaults() {
    return this._humanFeedbackDefaults
  }

  public get idGeneratorFn(): types.IDGeneratorFunction {
    return this._idGeneratorFn
  }

  openaiChatCompletion<TInput extends types.TaskInput = any>(
    promptOrChatCompletionParams:
      | types.ChatMessageContent<TInput>
      | SetOptional<types.OpenAIChatCompletionParamsInput<TInput>, 'model'>,
    modelParams?: SetOptional<
      types.OpenAIChatCompletionParamsInput,
      'model' | 'messages'
    >
  ) {
    let options: SetOptional<
      types.OpenAIChatCompletionParamsInput<TInput>,
      'model'
    >

    if (
      isString(promptOrChatCompletionParams) ||
      isFunction(promptOrChatCompletionParams)
    ) {
      options = {
        ...modelParams,
        messages: [
          {
            role: 'user',
            content: promptOrChatCompletionParams
          }
        ]
      }
    } else {
      options = { ...promptOrChatCompletionParams, ...modelParams }

      if (!options.messages) {
        throw new Error('messages must be provided')
      }
    }

    return new OpenAIChatCompletion<TInput>({
      ...this._openaiModelDefaults,
      agentic: this,
      ...options
    })
  }

  /**
   * Shortcut for creating an OpenAI chat completion call with the `gpt-3.5-turbo` model.
   */
  gpt3<TInput extends types.TaskInput = any>(
    promptOrChatCompletionParams:
      | types.ChatMessageContent<TInput>
      | SetOptional<types.OpenAIChatCompletionParamsInput<TInput>, 'model'>,
    modelParams?: SetOptional<
      types.OpenAIChatCompletionParamsInput,
      'model' | 'messages'
    >
  ) {
    let options: SetOptional<
      types.OpenAIChatCompletionParamsInput<TInput>,
      'model'
    >

    if (
      isString(promptOrChatCompletionParams) ||
      isFunction(promptOrChatCompletionParams)
    ) {
      options = {
        ...modelParams,
        messages: [
          {
            role: 'user',
            content: promptOrChatCompletionParams
          }
        ]
      }
    } else {
      options = { ...promptOrChatCompletionParams, ...modelParams }

      if (!options.messages) {
        throw new Error('messages must be provided')
      }
    }

    return new OpenAIChatCompletion<TInput>({
      ...this._openaiModelDefaults,
      agentic: this,
      model: 'gpt-3.5-turbo',
      ...options
    })
  }

  /**
   * Shortcut for creating an OpenAI chat completion call with the `gpt-4` model.
   */
  gpt4<TInput extends types.TaskInput = any>(
    promptOrChatCompletionParams:
      | types.ChatMessageContent<TInput>
      | SetOptional<types.OpenAIChatCompletionParamsInput<TInput>, 'model'>,
    modelParams?: SetOptional<
      types.OpenAIChatCompletionParamsInput,
      'model' | 'messages'
    >
  ) {
    let options: SetOptional<
      types.OpenAIChatCompletionParamsInput<TInput>,
      'model'
    >

    if (
      isString(promptOrChatCompletionParams) ||
      isFunction(promptOrChatCompletionParams)
    ) {
      options = {
        ...modelParams,
        messages: [
          {
            role: 'user',
            content: promptOrChatCompletionParams
          }
        ]
      }
    } else {
      options = { ...promptOrChatCompletionParams, ...modelParams }

      if (!options.messages) {
        throw new Error('messages must be provided')
      }
    }

    return new OpenAIChatCompletion<TInput>({
      ...this._openaiModelDefaults,
      agentic: this,
      model: 'gpt-4',
      ...options
    })
  }
}
