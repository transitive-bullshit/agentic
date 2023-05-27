import * as types from './types'
import { defaultOpenAIModel } from './constants'
import { OpenAIChatModelBuilder } from './openai'

export class Agentic {
  _client: types.openai.OpenAIClient
  _verbosity: number
  _defaults: Pick<
    types.BaseLLMOptions,
    'provider' | 'model' | 'modelParams' | 'timeoutMs' | 'retryConfig'
  >

  constructor(opts: {
    openai: types.openai.OpenAIClient
    verbosity?: number
    defaults?: Pick<
      types.BaseLLMOptions,
      'provider' | 'model' | 'modelParams' | 'timeoutMs' | 'retryConfig'
    >
  }) {
    this._client = opts.openai
    this._verbosity = opts.verbosity ?? 0
    this._defaults = {
      provider: 'openai',
      model: defaultOpenAIModel,
      modelParams: {},
      timeoutMs: 2 * 60000,
      retryConfig: {
        attempts: 3,
        strategy: 'heal',
        ...opts.defaults?.retryConfig
      },
      ...opts.defaults
    }
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

    return new OpenAIChatModelBuilder(this._client, {
      ...(this._defaults as any), // TODO
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

    return new OpenAIChatModelBuilder(this._client, {
      ...(this._defaults as any), // TODO
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

    return new OpenAIChatModelBuilder(this._client, {
      ...(this._defaults as any), // TODO
      model: 'gpt-4',
      ...options
    })
  }
}
