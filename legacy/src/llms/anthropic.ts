import * as anthropic from '@anthropic-ai/sdk'
import { type SetOptional } from 'type-fest'
import { ZodTypeAny, z } from 'zod'

import * as types from '@/types'
import { defaultAnthropicModel } from '@/constants'

import { BaseChatModel } from './llm'

const defaultStopSequences = [anthropic.HUMAN_PROMPT]

export class AnthropicChatModel<
  TInput extends ZodTypeAny = ZodTypeAny,
  TOutput extends ZodTypeAny = z.ZodType<string>
> extends BaseChatModel<
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

    if (this._agentic.anthropic) {
      this._client = this._agentic.anthropic
    } else {
      throw new Error(
        'AnthropicChatModel requires an Anthropic client to be configured on the Agentic runtime'
      )
    }
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

  public override clone(): AnthropicChatModel<TInput, TOutput> {
    return new AnthropicChatModel<TInput, TOutput>({
      agentic: this._agentic,
      timeoutMs: this._timeoutMs,
      retryConfig: this._retryConfig,
      inputSchema: this._inputSchema,
      outputSchema: this._outputSchema,
      provider: this._provider,
      model: this._model,
      examples: this._examples,
      messages: this._messages,
      ...this._modelParams
    })
  }
}
