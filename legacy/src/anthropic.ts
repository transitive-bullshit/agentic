import * as anthropic from '@anthropic-ai/sdk'
import { type SetOptional } from 'type-fest'
import { ZodTypeAny, z } from 'zod'

import * as types from './types'
import { defaultAnthropicModel } from './constants'
import { BaseChatModelBuilder } from './llm'

const defaultStopSequences = [anthropic.HUMAN_PROMPT]

export class AnthropicChatModelBuilder<
  TInput extends ZodTypeAny = ZodTypeAny,
  TOutput extends ZodTypeAny = z.ZodType<string>
> extends BaseChatModelBuilder<
  TInput,
  TOutput,
  SetOptional<
    Omit<anthropic.SamplingParameters, 'prompt'>,
    'model' | 'max_tokens_to_sample' | 'stop_sequences'
  >,
  anthropic.CompletionResponse
> {
  _client: anthropic.Client

  constructor(
    client: anthropic.Client,
    options: types.ChatModelOptions<
      TInput,
      TOutput,
      SetOptional<
        Omit<anthropic.SamplingParameters, 'prompt'>,
        'model' | 'max_tokens_to_sample' | 'stop_sequences'
      >
    >
  ) {
    super({
      provider: 'anthropic',
      model: options.modelParams?.model || defaultAnthropicModel,
      ...options
    })

    this._client = client
  }

  protected override async _createChatCompletion(
    messages: types.ChatMessage[]
  ): Promise<types.BaseChatCompletionResponse<anthropic.CompletionResponse>> {
    const prompt =
      messages
        .map((message) => {
          switch (message.role) {
            case 'user':
              return `${anthropic.HUMAN_PROMPT} ${message.content}`
            case 'assistant':
              return `${anthropic.AI_PROMPT} ${message.content}`
            default:
              return message.content
          }
        })
        .join('') + anthropic.AI_PROMPT

    // TODO: support streaming
    // TODO: support max_tokens_to_sample
    // TODO: support stop_sequences correctly
    // TODO: handle errors gracefully

    const response = await this._client.complete({
      stop_sequences: defaultStopSequences,
      max_tokens_to_sample: 200, // TODO
      ...this._modelParams,
      model: this._model,
      prompt
    })

    return {
      message: {
        role: 'assistant',
        content: response.completion
      },
      response
    }
  }
}
