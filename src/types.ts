export type Role = 'user' | 'assistant'

export type FetchFn = typeof fetch

export type SendMessageOptions = {
  conversationId?: string
  parentMessageId?: string
  messageId?: string
  stream?: boolean
  promptPrefix?: string
  promptSuffix?: string
  timeoutMs?: number
  onProgress?: (partialResponse: ChatMessage) => void
  abortSignal?: AbortSignal
  queueWithCompletion?: string
}

export type MessageActionType = 'next' | 'variant'

export type SendMessageBrowserOptions = {
  conversationId?: string
  parentMessageId?: string
  messageId?: string
  action?: MessageActionType
  timeoutMs?: number
  onProgress?: (partialResponse: ChatMessage) => void
  abortSignal?: AbortSignal
}

export interface ChatMessage {
  id: string
  text: string
  role: Role
  parentMessageId?: string
  conversationId?: string
  detail?: any
}

export type ChatGPTErrorType =
  | 'unknown'
  | 'chatgpt:pool:account-on-cooldown'
  | 'chatgpt:pool:account-not-found'
  | 'chatgpt:pool:no-accounts'
  | 'chatgpt:pool:timeout'
  | 'chatgpt:pool:rate-limit'
  | 'chatgpt:pool:unavailable'

export class ChatGPTError extends Error {
  statusCode?: number
  statusText?: string
  isFinal?: boolean
  accountId?: string
  type?: ChatGPTErrorType
}

/** Returns a chat message from a store by it's ID (or null if not found). */
export type GetMessageByIdFunction = (id: string) => Promise<ChatMessage>

/** Upserts a chat message to a store. */
export type UpsertMessageFunction = (message: ChatMessage) => Promise<void>

export namespace openai {
  export type CompletionParams = {
    /** ID of the model to use. */
    model: string

    /** The string prompt to generate a completion for. */
    prompt: string

    /**
     * The suffix that comes after a completion of inserted text.
     */
    suffix?: string

    /**
     * The maximum number of tokens to generate in the completion.  The token count of your prompt plus `max_tokens` cannot exceed the model\'s context length. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
     */
    max_tokens?: number

    /**
     * What [sampling temperature](https://towardsdatascience.com/how-to-sample-from-language-models-682bceb97277) to use. Higher values means the model will take more risks. Try 0.9 for more creative applications, and 0 (argmax sampling) for ones with a well-defined answer.  We generally recommend altering this or `top_p` but not both.
     */
    temperature?: number

    /**
     * An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered.  We generally recommend altering this or `temperature` but not both.
     */
    top_p?: number

    /**
     * Include the log probabilities on the `logprobs` most likely tokens, as well the chosen tokens. For example, if `logprobs` is 5, the API will return a list of the 5 most likely tokens. The API will always return the `logprob` of the sampled token, so there may be up to `logprobs+1` elements in the response.  The maximum value for `logprobs` is 5. If you need more than this, please contact us through our [Help center](https://help.openai.com) and describe your use case.
     */
    logprobs?: number

    /**
     * Echo back the prompt in addition to the completion
     */
    echo?: boolean

    /**
     * Up to 4 sequences where the API will stop generating further tokens. The returned text will not contain the stop sequence.
     */
    stop?: string[]

    /**
     * Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model\'s likelihood to talk about new topics.  [See more information about frequency and presence penalties.](/docs/api-reference/parameter-details)
     */
    presence_penalty?: number

    /**
     * Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model\'s likelihood to repeat the same line verbatim.  [See more information about frequency and presence penalties.](/docs/api-reference/parameter-details)
     */
    frequency_penalty?: number

    /**
     * Generates `best_of` completions server-side and returns the \"best\" (the one with the highest log probability per token). Results cannot be streamed.  When used with `n`, `best_of` controls the number of candidate completions and `n` specifies how many to return – `best_of` must be greater than `n`.  **Note:** Because this parameter generates many completions, it can quickly consume your token quota. Use carefully and ensure that you have reasonable settings for `max_tokens` and `stop`.
     */
    best_of?: number

    /**
     * Modify the likelihood of specified tokens appearing in the completion.  Accepts a json object that maps tokens (specified by their token ID in the GPT tokenizer) to an associated bias value from -100 to 100. You can use this [tokenizer tool](/tokenizer?view=bpe) (which works for both GPT-2 and GPT-3) to convert text to token IDs. Mathematically, the bias is added to the logits generated by the model prior to sampling. The exact effect will vary per model, but values between -1 and 1 should decrease or increase likelihood of selection; values like -100 or 100 should result in a ban or exclusive selection of the relevant token.  As an example, you can pass `{\"50256\": -100}` to prevent the <|endoftext|> token from being generated.
     */
    logit_bias?: Record<string, number>

    /**
     * A unique identifier representing your end-user, which will help OpenAI to monitor and detect abuse. [Learn more](/docs/usage-policies/end-user-ids).
     */
    user?: string

    /* NOTE: this is handled by the `sendMessage` function.
     *
     * Whether to stream back partial progress. If set, tokens will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available, with the stream terminated by a `data: [DONE]` message.
     */
    // stream?: boolean | null

    /**
     * NOT SUPPORTED
     */
    /**
     * How many completions to generate for each prompt.  **Note:** Because this parameter generates many completions, it can quickly consume your token quota. Use carefully and ensure that you have reasonable settings for `max_tokens` and `stop`.
     */
    // 'n'?: number | null;
  }

  export type ReverseProxyCompletionParams = CompletionParams & {
    paid?: boolean
  }

  export type CompletionResponse = {
    id: string
    object: string
    created: number
    model: string
    choices: CompletionResponseChoices
    usage?: CompletionResponseUsage
  }

  export type CompletionResponseChoices = {
    text?: string
    index?: number
    logprobs?: {
      tokens?: Array<string>
      token_logprobs?: Array<number>
      top_logprobs?: Array<object>
      text_offset?: Array<number>
    } | null
    finish_reason?: string
  }[]

  export type CompletionResponseUsage = {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * https://chat.openapi.com/backend-api/conversation
 */
export type ConversationJSONBody = {
  /**
   * The action to take
   */
  action: string

  /**
   * The ID of the conversation
   */
  conversation_id?: string

  /**
   * Prompts to provide
   */
  messages: Prompt[]

  /**
   * The model to use
   */
  model: string

  /**
   * The parent message ID
   */
  parent_message_id: string
}

export type Prompt = {
  /**
   * The content of the prompt
   */
  content: PromptContent

  /**
   * The ID of the prompt
   */
  id: string

  /**
   * The role played in the prompt
   */
  role: Role
}

export type ContentType = 'text'

export type PromptContent = {
  /**
   * The content type of the prompt
   */
  content_type: ContentType

  /**
   * The parts to the prompt
   */
  parts: string[]
}

export type ConversationResponseEvent = {
  message?: Message
  conversation_id?: string
  error?: string | null
}

export type Message = {
  id: string
  content: MessageContent
  role: Role
  user: string | null
  create_time: string | null
  update_time: string | null
  end_turn: null
  weight: number
  recipient: string
  metadata: MessageMetadata
}

export type MessageContent = {
  content_type: string
  parts: string[]
}

export type MessageMetadata = any

export type GetAccessTokenFn = ({
  email,
  password,
  sessionToken
}: {
  email: string
  password: string
  sessionToken?: string
}) => string | Promise<string>
