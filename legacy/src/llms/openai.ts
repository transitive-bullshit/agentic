import { type SetOptional } from 'type-fest'

import * as types from '@/types'
import { DEFAULT_OPENAI_MODEL } from '@/constants'

import { BaseChatModel } from './chat'

export class OpenAIChatModel<
  TInput = any,
  TOutput = string
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
    super({
      provider: 'openai',
      model: options.modelParams?.model || DEFAULT_OPENAI_MODEL,
      ...options
    })

    if (this._agentic.openai) {
      this._client = this._agentic.openai
    } else {
      throw new Error(
        'OpenAIChatModel requires an OpenAI client to be configured on the Agentic runtime'
      )
    }
  }

  public override get nameForModel(): string {
    return 'openai_chat'
  }

  public override get nameForHuman(): string {
    return 'OpenAIChatModel'
  }

  protected override async _createChatCompletion(
    messages: types.ChatMessage[]
  ): Promise<
    types.BaseChatCompletionResponse<types.openai.ChatCompletionResponse>
  > {
    const res = await this._client.createChatCompletion({
      ...this._modelParams,
      model: this._model,
      messages
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
