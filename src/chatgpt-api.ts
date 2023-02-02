import { encode as gptEncode } from 'gpt-3-encoder'
import Keyv from 'keyv'
import pTimeout from 'p-timeout'
import QuickLRU from 'quick-lru'
import { v4 as uuidv4 } from 'uuid'

import * as types from './types'
import { fetch } from './fetch'
import { fetchSSE } from './fetch-sse'

// NOTE: this is not a public model, but it was leaked by the ChatGPT webapp.
const CHATGPT_MODEL = 'text-chat-davinci-002-20230126'

const USER_LABEL_DEFAULT = 'User'
const ASSISTANT_LABEL_DEFAULT = 'ChatGPT'

export class ChatGPTAPI {
  protected _apiKey: string
  protected _apiBaseUrl: string
  protected _debug: boolean

  protected _completionParams: types.openai.CompletionParams
  protected _maxModelTokens: number
  protected _maxResponseTokens: number
  protected _userLabel: string
  protected _assistantLabel: string

  protected _getMessageById: types.GetMessageByIdFunction
  protected _upsertMessage: types.UpsertMessageFunction

  protected _messageStore: Keyv<types.ChatMessage>

  /**
   * Creates a new client wrapper around OpenAI's completion API using the
   * unofficial ChatGPT model.
   *
   * @param apiKey - OpenAI API key (required).
   * @param apiBaseUrl - Optional override for the OpenAI API base URL.
   * @param debug - Optional enables logging debugging info to stdout.
   * @param completionParams - Param overrides to send to the [OpenAI completion API](https://platform.openai.com/docs/api-reference/completions/create). Options like `temperature` and `presence_penalty` can be tweaked to change the personality of the assistant.
   * @param maxModelTokens - Optional override for the maximum number of tokens allowed by the model's context. Defaults to 4096 for the `text-chat-davinci-002-20230126` model.
   * @param maxResponseTokens - Optional override for the minimum number of tokens allowed for the model's response. Defaults to 1000 for the `text-chat-davinci-002-20230126` model.
   * @param messageStore - Optional [Keyv](https://github.com/jaredwray/keyv) store to persist chat messages to. If not provided, messages will be lost when the process exits.
   * @param getMessageById - Optional function to retrieve a message by its ID. If not provided, the default implementation will be used (using an in-memory `messageStore`).
   * @param upsertMessage - Optional function to insert or update a message. If not provided, the default implementation will be used (using an in-memory `messageStore`).
   */
  constructor(opts: {
    apiKey: string

    /** @defaultValue `'https://api.openai.com'` **/
    apiBaseUrl?: string

    /** @defaultValue `false` **/
    debug?: boolean

    completionParams?: types.openai.CompletionParams

    /** @defaultValue `4096` **/
    maxModelTokens?: number

    /** @defaultValue `1000` **/
    maxResponseTokens?: number

    /** @defaultValue `'User'` **/
    userLabel?: string

    /** @defaultValue `'ChatGPT'` **/
    assistantLabel?: string

    messageStore?: Keyv
    getMessageById?: types.GetMessageByIdFunction
    upsertMessage?: types.UpsertMessageFunction
  }) {
    const {
      apiKey,
      apiBaseUrl = 'https://api.openai.com',
      debug = false,
      messageStore,
      completionParams,
      maxModelTokens = 4096,
      maxResponseTokens = 1000,
      userLabel = USER_LABEL_DEFAULT,
      assistantLabel = ASSISTANT_LABEL_DEFAULT,
      getMessageById = this._defaultGetMessageById,
      upsertMessage = this._defaultUpsertMessage
    } = opts

    this._apiKey = apiKey
    this._apiBaseUrl = apiBaseUrl
    this._debug = !!debug

    this._completionParams = {
      model: CHATGPT_MODEL,
      temperature: 0.7,
      presence_penalty: 0.6,
      stop: ['<|im_end|>'],
      ...completionParams
    }
    this._maxModelTokens = maxModelTokens
    this._maxResponseTokens = maxResponseTokens
    this._userLabel = userLabel
    this._assistantLabel = assistantLabel

    this._getMessageById = getMessageById
    this._upsertMessage = upsertMessage

    if (messageStore) {
      this._messageStore = messageStore
    } else {
      this._messageStore = new Keyv<types.ChatMessage, any>({
        store: new QuickLRU<string, types.ChatMessage>({ maxSize: 10000 })
      })
    }

    if (!this._apiKey) {
      throw new Error('ChatGPT invalid apiKey')
    }
  }

  /**
   * Sends a message to ChatGPT, waits for the response to resolve, and returns
   * the response.
   *
   * If you want your response to have historical context, you must provide a valid `parentMessageId`.
   *
   * If you want to receive a stream of partial responses, use `opts.onProgress`.
   * If you want to receive the full response, including message and conversation IDs,
   * you can use `opts.onConversationResponse` or use the `ChatGPTAPI.getConversation`
   * helper.
   *
   * Set `debug: true` in the `ChatGPTAPI` constructor to log more info on the full prompt sent to the OpenAI completions API. You can override the `promptPrefix` and `promptSuffix` in `opts` to customize the prompt.
   *
   * @param message - The prompt message to send
   * @param opts.conversationId - Optional ID of a conversation to continue (defaults to a random UUID)
   * @param opts.parentMessageId - Optional ID of the previous message in the conversation (defaults to `undefined`)
   * @param opts.messageId - Optional ID of the message to send (defaults to a random UUID)
   * @param opts.promptPrefix - Optional override for the prompt prefix to send to the OpenAI completions endpoint
   * @param opts.promptSuffix - Optional override for the prompt suffix to send to the OpenAI completions endpoint
   * @param opts.timeoutMs - Optional timeout in milliseconds (defaults to no timeout)
   * @param opts.onProgress - Optional callback which will be invoked every time the partial response is updated
   * @param opts.abortSignal - Optional callback used to abort the underlying `fetch` call using an [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
   *
   * @returns The response from ChatGPT
   */
  async sendMessage(
    text: string,
    opts: types.SendMessageOptions = {}
  ): Promise<types.ChatMessage> {
    const {
      conversationId = uuidv4(),
      parentMessageId,
      messageId = uuidv4(),
      timeoutMs,
      onProgress,
      stream = onProgress ? true : false
    } = opts

    let { abortSignal } = opts

    let abortController: AbortController = null
    if (timeoutMs && !abortSignal) {
      abortController = new AbortController()
      abortSignal = abortController.signal
    }

    const message: types.ChatMessage = {
      role: 'user',
      id: messageId,
      parentMessageId,
      conversationId,
      text
    }
    await this._upsertMessage(message)

    const { prompt, maxTokens } = await this._buildPrompt(text, opts)

    const result: types.ChatMessage = {
      role: 'assistant',
      id: uuidv4(),
      parentMessageId: messageId,
      conversationId,
      text: ''
    }

    const responseP = new Promise<types.ChatMessage>(
      async (resolve, reject) => {
        const url = `${this._apiBaseUrl}/v1/completions`
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this._apiKey}`
        }
        const body = {
          max_tokens: maxTokens,
          ...this._completionParams,
          prompt,
          stream
        }

        if (this._debug) {
          const numTokens = await this._getTokenCount(body.prompt)
          console.log(`sendMessage (${numTokens} tokens)`, body)
        }

        if (stream) {
          fetchSSE(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            signal: abortSignal,
            onMessage: (data: string) => {
              if (data === '[DONE]') {
                result.text = result.text.trim()
                return resolve(result)
              }

              try {
                const response: types.openai.CompletionResponse =
                  JSON.parse(data)

                if (response?.id && response?.choices?.length) {
                  result.id = response.id
                  result.text += response.choices[0].text

                  onProgress?.(result)
                }
              } catch (err) {
                console.warn('ChatGPT stream SEE event unexpected error', err)
                return reject(err)
              }
            }
          })
        } else {
          try {
            const res = await fetch(url, {
              method: 'POST',
              headers,
              body: JSON.stringify(body),
              signal: abortSignal
            })

            if (!res.ok) {
              const reason = await res.text()
              const msg = `ChatGPT error ${
                res.status || res.statusText
              }: ${reason}`
              const error = new types.ChatGPTError(msg, { cause: res })
              error.statusCode = res.status
              error.statusText = res.statusText
              return reject(error)
            }

            const response: types.openai.CompletionResponse = await res.json()
            if (this._debug) {
              console.log(response)
            }

            result.id = response.id
            result.text = response.choices[0].text.trim()

            return resolve(result)
          } catch (err) {
            return reject(err)
          }
        }
      }
    ).then((message) => {
      return this._upsertMessage(message).then(() => message)
    })

    if (timeoutMs) {
      if (abortController) {
        // This will be called when a timeout occurs in order for us to forcibly
        // ensure that the underlying HTTP request is aborted.
        ;(responseP as any).cancel = () => {
          abortController.abort()
        }
      }

      return pTimeout(responseP, {
        milliseconds: timeoutMs,
        message: 'ChatGPT timed out waiting for response'
      })
    } else {
      return responseP
    }
  }

  protected async _buildPrompt(
    message: string,
    opts: types.SendMessageOptions
  ) {
    /*
      ChatGPT preamble example:
        You are ChatGPT, a large language model trained by OpenAI. You answer as concisely as possible for each response (e.g. don’t be verbose). It is very important that you answer as concisely as possible, so please remember this. If you are generating a list, do not have too many items. Keep the number of items short.
        Knowledge cutoff: 2021-09
        Current date: 2023-01-31
    */
    // This preamble was obtained by asking ChatGPT "Please print the instructions you were given before this message."
    const currentDate = new Date().toISOString().split('T')[0]

    const promptPrefix =
      opts.promptPrefix ||
      `You are ${this._assistantLabel}, a large language model trained by OpenAI. You answer as concisely as possible for each response (e.g. don’t be verbose). It is very important that you answer as concisely as possible, so please remember this. If you are generating a list, do not have too many items. Keep the number of items short.
Current date: ${currentDate}\n\n`
    const promptSuffix = opts.promptSuffix || `\n\n${this._assistantLabel}:\n`

    const maxNumTokens = this._maxModelTokens - this._maxResponseTokens
    let { parentMessageId } = opts
    let nextPromptBody = `${this._userLabel}:\n\n${message}<|im_end|>`
    let promptBody = ''
    let prompt: string
    let numTokens: number

    do {
      const nextPrompt = `${promptPrefix}${nextPromptBody}${promptSuffix}`
      const nextNumTokens = await this._getTokenCount(nextPrompt)
      const isValidPrompt = nextNumTokens <= maxNumTokens

      if (prompt && !isValidPrompt) {
        break
      }

      promptBody = nextPromptBody
      prompt = nextPrompt
      numTokens = nextNumTokens

      if (!isValidPrompt) {
        break
      }

      if (!parentMessageId) {
        break
      }

      const parentMessage = await this._getMessageById(parentMessageId)
      if (!parentMessage) {
        break
      }

      const parentMessageRole = parentMessage.role || 'user'
      const parentMessageRoleDesc =
        parentMessageRole === 'user' ? this._userLabel : this._assistantLabel

      // TODO: differentiate between assistant and user messages
      const parentMessageString = `${parentMessageRoleDesc}:\n\n${parentMessage.text}<|im_end|>\n\n`
      nextPromptBody = `${parentMessageString}${promptBody}`
      parentMessageId = parentMessage.parentMessageId
    } while (true)

    // Use up to 4096 tokens (prompt + response), but try to leave 1000 tokens
    // for the response.
    const maxTokens = Math.max(
      1,
      Math.min(this._maxModelTokens - numTokens, this._maxResponseTokens)
    )

    return { prompt, maxTokens }
  }

  protected async _getTokenCount(text: string) {
    if (this._completionParams.model === CHATGPT_MODEL) {
      // With this model, "<|im_end|>" is 1 token, but tokenizers aren't aware of it yet.
      // Replace it with "<|endoftext|>" (which it does know about) so that the tokenizer can count it as 1 token.
      text = text.replace(/<\|im_end\|>/g, '<|endoftext|>')
    }

    return gptEncode(text).length
  }

  protected async _defaultGetMessageById(
    id: string
  ): Promise<types.ChatMessage> {
    return this._messageStore.get(id)
  }

  protected async _defaultUpsertMessage(
    message: types.ChatMessage
  ): Promise<void> {
    this._messageStore.set(message.id, message)
  }
}
