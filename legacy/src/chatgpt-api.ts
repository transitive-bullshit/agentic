import { encode as gptEncode } from 'gpt-3-encoder'
import pTimeout from 'p-timeout'
import QuickLRU from 'quick-lru'
import { v4 as uuidv4 } from 'uuid'

import * as types from './types'
import { fetch } from './fetch'
import { fetchSSE } from './fetch-sse'

const CHATGPT_MODEL = 'text-chat-davinci-002-20230126'
const USER_LABEL = 'User'
const ASSISTANT_LABEL = 'ChatGPT'

export class ChatGPTAPI {
  protected _apiKey: string
  protected _apiBaseUrl: string
  protected _model: string
  protected _temperature: number
  protected _presencePenalty: number
  protected _stop: string[]
  protected _debug: boolean
  protected _getMessageById: types.GetMessageByIdFunction
  protected _messageCache: QuickLRU<string, types.ChatMessage>

  /**
   * Creates a new client wrapper around OpenAI's completion API using the
   * unofficial ChatGPT model.
   *
   * @param debug - Optional enables logging debugging into to stdout
   */
  constructor(opts: {
    apiKey: string

    /** @defaultValue `'https://api.openai.com'` **/
    apiBaseUrl?: string

    /** @defaultValue `'text-chat-davinci-002-20230126'` **/
    model?: string

    /** @defaultValue 0.7 **/
    temperature?: number

    /** @defaultValue 0.6 **/
    presencePenalty?: number

    stop?: string[]

    /** @defaultValue `false` **/
    debug?: boolean

    getMessageById?: types.GetMessageByIdFunction
  }) {
    const {
      apiKey,
      apiBaseUrl = 'https://api.openai.com',
      model = CHATGPT_MODEL,
      temperature = 0.7,
      presencePenalty = 0.6,
      stop = ['<|im_end|>'],
      debug = false,
      getMessageById = this._defaultGetMessageById
    } = opts

    this._apiKey = apiKey
    this._apiBaseUrl = apiBaseUrl
    this._model = model
    this._temperature = temperature
    this._presencePenalty = presencePenalty
    this._stop = stop
    this._debug = !!debug
    this._getMessageById = getMessageById

    // override `getMessageById` if you want persistence
    this._messageCache = new QuickLRU({ maxSize: 10000 })

    if (!this._apiKey) {
      throw new Error('ChatGPT invalid apiKey')
    }
  }

  /**
   * Sends a message to ChatGPT, waits for the response to resolve, and returns
   * the response.
   *
   * If you want to receive a stream of partial responses, use `opts.onProgress`.
   * If you want to receive the full response, including message and conversation IDs,
   * you can use `opts.onConversationResponse` or use the `ChatGPTAPI.getConversation`
   * helper.
   *
   * @param message - The prompt message to send
   * @param opts.conversationId - Optional ID of a conversation to continue
   * @param opts.parentMessageId - Optional ID of the previous message in the conversation
   * @param opts.messageId - Optional ID of the message to send (defaults to a random UUID)
   * @param opts.action - Optional ChatGPT `action` (either `next` or `variant`)
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
      conversationId,
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

    const input: types.ChatMessage = {
      role: 'user',
      id: messageId,
      parentMessageId,
      conversationId,
      text
    }

    this._messageCache.set(input.id, input)
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
          prompt,
          stream,
          model: this._model,
          temperature: this._temperature,
          presence_penalty: this._presencePenalty,
          stop: this._stop,
          max_tokens: maxTokens
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
                const response = JSON.parse(data)

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

            const response = await res.json()
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
    )

    responseP.then((message) => {
      this._messageCache.set(message.id, message)
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
      `You are ${ASSISTANT_LABEL}, a large language model trained by OpenAI. You answer as concisely as possible for each response (e.g. don’t be verbose). It is very important that you answer as concisely as possible, so please remember this. If you are generating a list, do not have too many items. Keep the number of items short.
Current date: ${currentDate}\n\n`
    const promptSuffix = opts.promptSuffix || `\n\n${ASSISTANT_LABEL}:\n`

    const maxNumTokens = 3097
    let { parentMessageId } = opts
    let nextPromptBody = `${USER_LABEL}:\n\n${message}`
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
        parentMessageRole === 'user' ? USER_LABEL : ASSISTANT_LABEL

      // TODO: differentiate between assistant and user messages
      const parentMessageString = `${parentMessageRoleDesc}:\n\n${parentMessage.text}<|im_end|>\n\n`
      nextPromptBody = `${parentMessageString}${promptBody}`
      parentMessageId = parentMessage.parentMessageId
    } while (true)

    // Use up to 4097 tokens (prompt + response), but try to leave 1000 tokens
    // for the response.
    const maxTokens = Math.max(1, Math.min(4097 - numTokens, 1000))

    return { prompt, maxTokens }
  }

  protected async _getTokenCount(text: string) {
    if (this._model === CHATGPT_MODEL) {
      // With this model, "<|im_end|>" is 1 token, but tokenizers aren't aware of it yet.
      // Replace it with "<|endoftext|>" (which it does know about) so that the tokenizer can count it as 1 token.
      text = text.replace(/<\|im_end\|>/g, '<|endoftext|>')
    }

    return gptEncode(text).length
  }

  protected async _defaultGetMessageById(
    id: string
  ): Promise<types.ChatMessage> {
    return this._messageCache.get(id)
  }
}
