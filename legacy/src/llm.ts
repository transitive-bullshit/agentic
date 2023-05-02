import type { ZodType } from 'zod'

import * as types from './types'

export class Agentic {
  _client: types.openai.OpenAIClient
  _verbosity: number
  _defaults: Pick<
    types.BaseLLMOptions,
    'provider' | 'model' | 'modelParams' | 'timeoutMs' | 'retryConfig'
  >

  constructor(
    client: types.openai.OpenAIClient,
    opts: {
      verbosity?: number
      defaults?: Pick<
        types.BaseLLMOptions,
        'provider' | 'model' | 'modelParams' | 'timeoutMs' | 'retryConfig'
      >
    } = {}
  ) {
    this._client = client
    this._verbosity = opts.verbosity ?? 0
    this._defaults = {
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      modelParams: {},
      timeoutMs: 30000,
      retryConfig: {
        attempts: 3,
        strategy: 'heal',
        ...opts.defaults?.retryConfig
      },
      ...opts.defaults
    }
  }

  gpt4(
    promptOrChatCompletionParams: string | types.openai.ChatCompletionParams
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
        throw new Error()
      }
    }

    return new OpenAIChatModelBuilder(this._client, {
      ...(this._defaults as any), // TODO
      model: 'gpt-4',
      ...options
    })
  }
}

export abstract class BaseLLMCallBuilder<TInput, TOutput, TModelParams> {
  _options: types.BaseLLMOptions<TInput, TOutput, TModelParams>

  constructor(options: types.BaseLLMOptions<TInput, TOutput, TModelParams>) {
    this._options = options
  }

  input(inputSchema: ZodType<TInput>) {
    this._options.input = inputSchema
    return this
  }

  output(outputSchema: ZodType<TOutput>) {
    this._options.output = outputSchema
    return this
  }

  examples(examples: types.LLMExample[]) {
    this._options.examples = examples
    return this
  }

  retry(retryConfig: types.LLMRetryConfig) {
    this._options.retryConfig = retryConfig
    return this
  }

  abstract call(input?: TInput): Promise<TOutput>
}

export abstract class ChatModelBuilder<
  TInput,
  TOutput,
  TModelParams
> extends BaseLLMCallBuilder<TInput, TOutput, TModelParams> {
  _messages: types.ChatMessage[]

  constructor(options: types.ChatModelOptions<TInput, TOutput, TModelParams>) {
    super(options)

    this._messages = options.messages
  }
}

export class OpenAIChatModelBuilder<TInput, TOutput> extends ChatModelBuilder<
  TInput,
  TOutput,
  Omit<types.openai.ChatCompletionParams, 'messages'>
> {
  _client: types.openai.OpenAIClient

  constructor(
    client: types.openai.OpenAIClient,
    options: types.ChatModelOptions<
      TInput,
      TOutput,
      Omit<types.openai.ChatCompletionParams, 'messages'>
    >
  ) {
    super({
      provider: 'openai',
      ...options
    })

    this._client = client
  }

  override async call(input?: TInput): Promise<TOutput> {
    // TODO
  }
}
