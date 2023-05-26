import type { SetRequired } from 'type-fest'
import { ZodRawShape, ZodTypeAny, z } from 'zod'

import * as types from './types'
import { defaultOpenAIModel } from './constants'
import { BaseChatModelBuilder } from './llm'

export class OpenAIChatModelBuilder<
  TInput extends ZodRawShape | ZodTypeAny = ZodTypeAny,
  TOutput extends ZodRawShape | ZodTypeAny = z.ZodType<string>
> extends BaseChatModelBuilder<
  TInput,
  TOutput,
  SetRequired<Omit<types.openai.ChatCompletionParams, 'messages'>, 'model'>,
  types.openai.ChatCompletionResponse
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
      model: defaultOpenAIModel,
      ...options
    })

    this._client = client
  }

  protected override async _createChatCompletion(
    messages: types.ChatMessage[]
  ): Promise<
    types.BaseChatCompletionResponse<types.openai.ChatCompletionResponse>
  > {
    return this._client.createChatCompletion({
      model: this._model,
      ...this._modelParams,
      messages
    })
  }
}
