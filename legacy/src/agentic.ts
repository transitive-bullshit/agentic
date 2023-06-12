import * as types from '@/types'
import { DEFAULT_OPENAI_MODEL } from '@/constants'
import { OpenAIChatModel } from '@/llms/openai'

import {
  HumanFeedbackMechanism,
  HumanFeedbackMechanismCLI
} from './human-feedback'
import { defaultIDGeneratorFn } from './utils'

export class Agentic {
  // _taskMap: WeakMap<string, BaseTask<any, any>>

  protected _openai?: types.openai.OpenAIClient
  protected _anthropic?: types.anthropic.Client

  protected _verbosity: number
  protected _openaiModelDefaults: Pick<
    types.BaseLLMOptions,
    'provider' | 'model' | 'modelParams' | 'timeoutMs' | 'retryConfig'
  >
  protected _defaultHumanFeedbackMechamism?: HumanFeedbackMechanism
  protected _idGeneratorFn: types.IDGeneratorFunction

  constructor(opts: {
    openai?: types.openai.OpenAIClient
    anthropic?: types.anthropic.Client
    verbosity?: number
    openaiModelDefaults?: Pick<
      types.BaseLLMOptions,
      'provider' | 'model' | 'modelParams' | 'timeoutMs' | 'retryConfig'
    >
    defaultHumanFeedbackMechanism?: HumanFeedbackMechanism
    idGeneratorFn?: types.IDGeneratorFunction
  }) {
    this._openai = opts.openai
    this._anthropic = opts.anthropic

    this._verbosity = opts.verbosity ?? 0

    this._openaiModelDefaults = {
      provider: 'openai',
      model: DEFAULT_OPENAI_MODEL,
      modelParams: {},
      timeoutMs: 2 * 60000,
      retryConfig: {
        retries: 3,
        strategy: 'heal',
        ...opts.openaiModelDefaults?.retryConfig
      },
      ...opts.openaiModelDefaults
    }

    // TODO
    // this._anthropicModelDefaults = {}

    this._defaultHumanFeedbackMechamism =
      opts.defaultHumanFeedbackMechanism ??
      new HumanFeedbackMechanismCLI({ agentic: this })

    this._idGeneratorFn = opts.idGeneratorFn ?? defaultIDGeneratorFn
  }

  public get openai(): types.openai.OpenAIClient | undefined {
    return this._openai
  }

  public get anthropic(): types.anthropic.Client | undefined {
    return this._anthropic
  }

  public get defaultHumanFeedbackMechamism() {
    return this._defaultHumanFeedbackMechamism
  }

  public get idGeneratorFn(): types.IDGeneratorFunction {
    return this._idGeneratorFn
  }

  llm(
    promptOrChatCompletionParams:
      | string
      | Partial<types.openai.ChatCompletionParams> // TODO: make more strict
  ) {
    let options: Partial<types.openai.ChatCompletionParams>

    if (typeof promptOrChatCompletionParams === 'string') {
      options = {
        messages: [
          {
            role: 'user',
            content: promptOrChatCompletionParams
          }
        ]
      }
    } else {
      options = promptOrChatCompletionParams

      if (!options.messages) {
        throw new Error('messages must be provided')
      }
    }

    return new OpenAIChatModel({
      agentic: this,
      ...(this._openaiModelDefaults as any), // TODO
      ...options
    })
  }

  gpt3(
    promptOrChatCompletionParams:
      | string
      | Omit<types.openai.ChatCompletionParams, 'model'>
  ) {
    let options: Omit<types.openai.ChatCompletionParams, 'model'>

    if (typeof promptOrChatCompletionParams === 'string') {
      options = {
        messages: [
          {
            role: 'user',
            content: promptOrChatCompletionParams
          }
        ]
      }
    } else {
      options = promptOrChatCompletionParams

      if (!options.messages) {
        throw new Error('messages must be provided')
      }
    }

    return new OpenAIChatModel({
      agentic: this,
      ...(this._openaiModelDefaults as any), // TODO
      model: 'gpt-3.5-turbo',
      ...options
    })
  }

  gpt4(
    promptOrChatCompletionParams:
      | string
      | Omit<types.openai.ChatCompletionParams, 'model'>
  ) {
    let options: Omit<types.openai.ChatCompletionParams, 'model'>

    if (typeof promptOrChatCompletionParams === 'string') {
      options = {
        messages: [
          {
            role: 'user',
            content: promptOrChatCompletionParams
          }
        ]
      }
    } else {
      options = promptOrChatCompletionParams

      if (!options.messages) {
        throw new Error('messages must be provided')
      }
    }

    return new OpenAIChatModel({
      agentic: this,
      ...(this._openaiModelDefaults as any), // TODO
      model: 'gpt-4',
      ...options
    })
  }
}
