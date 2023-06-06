import { type SetOptional } from 'type-fest'
import { ZodTypeAny, z } from 'zod'

import * as types from './types'
import { defaultOpenAIModel } from './constants'
import { BaseChatModel } from './llm'

export class OpenAIChatModel<
  TInput extends ZodTypeAny = ZodTypeAny,
  TOutput extends ZodTypeAny = z.ZodType<string>
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
      model: options.modelParams?.model || defaultOpenAIModel,
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

  protected override async _createChatCompletion(
    messages: types.ChatMessage[]
  ): Promise<
    types.BaseChatCompletionResponse<types.openai.ChatCompletionResponse>
  > {
    return this._client.createChatCompletion({
      ...this._modelParams,
      model: this._model,
      messages
    })
  }
}
