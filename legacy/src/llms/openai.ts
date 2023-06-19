import type { SetOptional } from 'type-fest'

import * as types from '@/types'
import { DEFAULT_OPENAI_MODEL } from '@/constants'
import { BaseTask } from '@/task'

import { BaseChatCompletion } from './chat'

const openaiModelsSupportingFunctions = new Set([
  'gpt-4-0613',
  'gpt-4-32k-0613',
  'gpt-3.5-turbo-0613',
  'gpt-3.5-turbo-16k'
])

export class OpenAIChatCompletion<
  TInput extends types.TaskInput = void,
  TOutput extends types.TaskOutput = string
> extends BaseChatCompletion<
  TInput,
  TOutput,
  SetOptional<Omit<types.openai.ChatCompletionParams, 'messages'>, 'model'>,
  types.openai.ChatCompletionResponse
> {
  _client: types.openai.OpenAIClient

  constructor(
    options: types.ChatModelOptions<
      TInput,
      TOutput,
      SetOptional<Omit<types.openai.ChatCompletionParams, 'messages'>, 'model'>
    >
  ) {
    const model = options.modelParams?.model || DEFAULT_OPENAI_MODEL
    super({
      provider: 'openai',
      model,
      ...options
    })

    if (this._agentic?.openai) {
      this._client = this._agentic.openai
    } else {
      throw new Error(
        'OpenAIChatCompletion requires an OpenAI client to be configured on the Agentic runtime'
      )
    }

    if (!this.supportsTools) {
      if (this._tools) {
        throw new Error(
          `This OpenAI chat model "${this.nameForHuman}" does not support tools`
        )
      }

      if (this._modelParams?.functions) {
        throw new Error(
          `This OpenAI chat model "${this.nameForHuman}" does not support functions`
        )
      }
    }
  }

  public override get nameForModel(): string {
    return 'openaiChatCompletion'
  }

  public override get nameForHuman(): string {
    return `OpenAIChatCompletion ${this._model}`
  }

  public override tools(tools: BaseTask<any, any>[]): this {
    if (!this.supportsTools) {
      switch (this._model) {
        case 'gpt-4':
          this._model = 'gpt-4-0613'
          break

        case 'gpt-4-32k':
          this._model = 'gpt-4-32k-0613'
          break

        case 'gpt-3.5-turbo':
          this._model = 'gpt-3.5-turbo-0613'
          break
      }
    }

    return super.tools(tools)
  }

  public override get supportsTools(): boolean {
    return openaiModelsSupportingFunctions.has(this._model)
  }

  public override validate() {
    super.validate()

    if (!this._client) {
      throw new Error(
        'OpenAIChatCompletion requires an OpenAI client to be configured on the Agentic runtime'
      )
    }

    if (!this.supportsTools) {
      if (this._tools) {
        throw new Error(
          `This OpenAI chat model "${this.nameForHuman}" does not support tools`
        )
      }

      if (this._modelParams?.functions) {
        throw new Error(
          `This OpenAI chat model "${this.nameForHuman}" does not support functions`
        )
      }
    }
  }

  protected override async _createChatCompletion(
    messages: types.ChatMessage[],
    functions?: types.openai.ChatMessageFunction[]
  ): Promise<
    types.BaseChatCompletionResponse<types.openai.ChatCompletionResponse>
  > {
    return this._client.createChatCompletion({
      ...this._modelParams,
      model: this._model,
      messages,
      functions
    })
  }

  public override clone(): OpenAIChatCompletion<TInput, TOutput> {
    return new OpenAIChatCompletion<TInput, TOutput>({
      agentic: this._agentic,
      timeoutMs: this._timeoutMs,
      retryConfig: this._retryConfig,
      inputSchema: this._inputSchema,
      outputSchema: this._outputSchema,
      provider: this._provider,
      model: this._model,
      examples: this._examples,
      messages: this._messages,
      tools: this._tools,
      ...this._modelParams
    })
  }
}
