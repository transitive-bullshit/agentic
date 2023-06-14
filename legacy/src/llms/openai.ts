import type { SetOptional } from 'type-fest'

import * as types from '@/types'
import { DEFAULT_OPENAI_MODEL } from '@/constants'

import { BaseChatModel } from './chat'

const openaiModelsSupportingFunctions = new Set([
  'gpt-4-0613',
  'gpt-4-32k-0613',
  'gpt-3.5-turbo-0613',
  'gpt-3.5-turbo-16k'
])

export class OpenAIChatModel<
  TInput extends void | types.JsonObject = any,
  TOutput extends types.JsonValue = string
> extends BaseChatModel<
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

    if (this._agentic.openai) {
      this._client = this._agentic.openai
    } else {
      throw new Error(
        'OpenAIChatModel requires an OpenAI client to be configured on the Agentic runtime'
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
    return `OpenAIChatModel ${this._model}`
  }

  public override get supportsTools(): boolean {
    return openaiModelsSupportingFunctions.has(this._model)
  }

  protected override async _createChatCompletion(
    messages: types.ChatMessage[],
    functions?: types.openai.ChatMessageFunction[]
  ): Promise<
    types.BaseChatCompletionResponse<types.openai.ChatCompletionResponse>
  > {
    const res = await this._client.createChatCompletion({
      ...this._modelParams,
      model: this._model,
      messages,
      functions
    })

    return res
  }

  public override clone(): OpenAIChatModel<TInput, TOutput> {
    return new OpenAIChatModel<TInput, TOutput>({
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
