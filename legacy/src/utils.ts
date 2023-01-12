import type * as PTimeoutTypes from 'p-timeout'
import type {
  EventSourceParseCallback,
  EventSourceParser
} from 'eventsource-parser'
import type { Page } from 'puppeteer'
import { remark } from 'remark'
import stripMarkdown from 'strip-markdown'

import * as types from './types'

declare global {
  function ChatGPTAPIBrowserOnProgress(
    partialChatResponse: types.ChatResponse
  ): Promise<void>
}

export function markdownToText(markdown?: string): string {
  return remark()
    .use(stripMarkdown)
    .processSync(markdown ?? '')
    .toString()
}

export async function minimizePage(page: Page) {
  const session = await page.target().createCDPSession()
  const goods = await session.send('Browser.getWindowForTarget')
  const { windowId } = goods
  await session.send('Browser.setWindowBounds', {
    windowId,
    bounds: { windowState: 'minimized' }
  })
}

export async function maximizePage(page: Page) {
  const session = await page.target().createCDPSession()
  const goods = await session.send('Browser.getWindowForTarget')
  const { windowId } = goods
  await session.send('Browser.setWindowBounds', {
    windowId,
    bounds: { windowState: 'normal' }
  })
}

export function isRelevantRequest(url: string): boolean {
  let pathname: string

  try {
    const parsedUrl = new URL(url)
    pathname = parsedUrl.pathname
    url = parsedUrl.toString()
  } catch (_) {
    return false
  }

  if (!url.startsWith('https://chat.openai.com')) {
    return false
  }

  if (
    !pathname.startsWith('/backend-api/') &&
    !pathname.startsWith('/api/auth/session')
  ) {
    return false
  }

  if (pathname.endsWith('backend-api/moderations')) {
    return false
  }

  return true
}

/**
 * This function is injected into the ChatGPT webapp page using puppeteer. It
 * has to be fully self-contained, so we copied a few third-party sources and
 * included them in here.
 */
export async function browserPostEventStream(
  url: string,
  accessToken: string,
  body: types.ConversationJSONBody,
  timeoutMs?: number
): Promise<types.ChatError | types.ChatResponse> {
  // Workaround for https://github.com/esbuild-kit/tsx/issues/113
  globalThis.__name = () => undefined

  class TimeoutError extends Error {
    readonly name: 'TimeoutError'

    constructor(message) {
      super(message)
      this.name = 'TimeoutError'
    }
  }

  /**
    An error to be thrown when the request is aborted by AbortController.
    DOMException is thrown instead of this Error when DOMException is available.
  */
  class AbortError extends Error {
    constructor(message) {
      super()
      this.name = 'AbortError'
      this.message = message
    }
  }

  const BOM = [239, 187, 191]

  let conversationId: string = body?.conversation_id
  const origMessageId = body?.messages?.[0]?.id
  let messageId: string = body?.messages?.[0]?.id
  let response = ''

  try {
    console.log('browserPostEventStream', url, accessToken, body)

    let abortController: AbortController = null
    if (timeoutMs) {
      abortController = new AbortController()
    }

    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      signal: abortController?.signal,
      headers: {
        accept: 'text/event-stream',
        'x-openai-assistant-app-id': '',
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json'
      }
    })

    console.log('browserPostEventStream response', res)

    if (!res.ok) {
      return {
        error: {
          message: `ChatGPTAPI error ${res.status || res.statusText}`,
          statusCode: res.status,
          statusText: res.statusText
        },
        conversationId,
        messageId
      }
    }

    const responseP = new Promise<types.ChatResponse>(
      async (resolve, reject) => {
        async function onMessage(data: string) {
          if (data === '[DONE]') {
            return resolve({
              response,
              conversationId,
              messageId
            })
          }

          let convoResponseEvent: types.ConversationResponseEvent
          try {
            convoResponseEvent = JSON.parse(data)
          } catch (err) {
            console.warn(
              'warning: chatgpt even stream parse error',
              err.toString(),
              data
            )
            return
          }

          if (!convoResponseEvent) {
            return
          }

          try {
            if (convoResponseEvent.conversation_id) {
              conversationId = convoResponseEvent.conversation_id
            }

            if (convoResponseEvent.message?.id) {
              messageId = convoResponseEvent.message.id
            }

            const partialResponse =
              convoResponseEvent.message?.content?.parts?.[0]
            if (partialResponse) {
              response = partialResponse

              if (window.ChatGPTAPIBrowserOnProgress) {
                const partialChatResponse = {
                  origMessageId,
                  response,
                  conversationId,
                  messageId
                }

                await window.ChatGPTAPIBrowserOnProgress(partialChatResponse)
              }
            }
          } catch (err) {
            console.warn('fetchSSE onMessage unexpected error', err)
            reject(err)
          }
        }

        const parser = createParser((event) => {
          if (event.type === 'event') {
            onMessage(event.data)
          }
        })

        for await (const chunk of streamAsyncIterable(res.body)) {
          const str = new TextDecoder().decode(chunk)
          parser.feed(str)
        }
      }
    )

    if (timeoutMs) {
      if (abortController) {
        // This will be called when a timeout occurs in order for us to forcibly
        // ensure that the underlying HTTP request is aborted.
        ;(responseP as any).cancel = () => {
          abortController.abort()
        }
      }

      return await pTimeout(responseP, {
        milliseconds: timeoutMs,
        message: 'ChatGPT timed out waiting for response'
      })
    } else {
      return await responseP
    }
  } catch (err) {
    const errMessageL = err.toString().toLowerCase()

    if (
      response &&
      (errMessageL === 'error: typeerror: terminated' ||
        errMessageL === 'typeerror: terminated')
    ) {
      // OpenAI sometimes forcefully terminates the socket from their end before
      // the HTTP request has resolved cleanly. In my testing, these cases tend to
      // happen when OpenAI has already send the last `response`, so we can ignore
      // the `fetch` error in this case.
      return {
        response,
        conversationId,
        messageId
      }
    }

    return {
      error: {
        message: err.toString(),
        statusCode: err.statusCode || err.status || err.response?.statusCode,
        statusText: err.statusText || err.response?.statusText
      },
      conversationId,
      messageId
    }
  }

  async function* streamAsyncIterable<T>(stream: ReadableStream<T>) {
    const reader = stream.getReader()
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          return
        }
        yield value
      }
    } finally {
      reader.releaseLock()
    }
  }

  // @see https://github.com/rexxars/eventsource-parser
  function createParser(onParse: EventSourceParseCallback): EventSourceParser {
    // Processing state
    let isFirstChunk: boolean
    let buffer: string
    let startingPosition: number
    let startingFieldLength: number

    // Event state
    let eventId: string | undefined
    let eventName: string | undefined
    let data: string

    reset()
    return { feed, reset }

    function reset(): void {
      isFirstChunk = true
      buffer = ''
      startingPosition = 0
      startingFieldLength = -1

      eventId = undefined
      eventName = undefined
      data = ''
    }

    function feed(chunk: string): void {
      buffer = buffer ? buffer + chunk : chunk

      // Strip any UTF8 byte order mark (BOM) at the start of the stream.
      // Note that we do not strip any non - UTF8 BOM, as eventsource streams are
      // always decoded as UTF8 as per the specification.
      if (isFirstChunk && hasBom(buffer)) {
        buffer = buffer.slice(BOM.length)
      }

      isFirstChunk = false

      // Set up chunk-specific processing state
      const length = buffer.length
      let position = 0
      let discardTrailingNewline = false

      // Read the current buffer byte by byte
      while (position < length) {
        // EventSource allows for carriage return + line feed, which means we
        // need to ignore a linefeed character if the previous character was a
        // carriage return
        // @todo refactor to reduce nesting, consider checking previous byte?
        // @todo but consider multiple chunks etc
        if (discardTrailingNewline) {
          if (buffer[position] === '\n') {
            ++position
          }
          discardTrailingNewline = false
        }

        let lineLength = -1
        let fieldLength = startingFieldLength
        let character: string

        for (
          let index = startingPosition;
          lineLength < 0 && index < length;
          ++index
        ) {
          character = buffer[index]
          if (character === ':' && fieldLength < 0) {
            fieldLength = index - position
          } else if (character === '\r') {
            discardTrailingNewline = true
            lineLength = index - position
          } else if (character === '\n') {
            lineLength = index - position
          }
        }

        if (lineLength < 0) {
          startingPosition = length - position
          startingFieldLength = fieldLength
          break
        } else {
          startingPosition = 0
          startingFieldLength = -1
        }

        parseEventStreamLine(buffer, position, fieldLength, lineLength)

        position += lineLength + 1
      }

      if (position === length) {
        // If we consumed the entire buffer to read the event, reset the buffer
        buffer = ''
      } else if (position > 0) {
        // If there are bytes left to process, set the buffer to the unprocessed
        // portion of the buffer only
        buffer = buffer.slice(position)
      }
    }

    function parseEventStreamLine(
      lineBuffer: string,
      index: number,
      fieldLength: number,
      lineLength: number
    ) {
      if (lineLength === 0) {
        // We reached the last line of this event
        if (data.length > 0) {
          onParse({
            type: 'event',
            id: eventId,
            event: eventName || undefined,
            data: data.slice(0, -1) // remove trailing newline
          })

          data = ''
          eventId = undefined
        }
        eventName = undefined
        return
      }

      const noValue = fieldLength < 0
      const field = lineBuffer.slice(
        index,
        index + (noValue ? lineLength : fieldLength)
      )
      let step = 0

      if (noValue) {
        step = lineLength
      } else if (lineBuffer[index + fieldLength + 1] === ' ') {
        step = fieldLength + 2
      } else {
        step = fieldLength + 1
      }

      const position = index + step
      const valueLength = lineLength - step
      const value = lineBuffer
        .slice(position, position + valueLength)
        .toString()

      if (field === 'data') {
        data += value ? `${value}\n` : '\n'
      } else if (field === 'event') {
        eventName = value
      } else if (field === 'id' && !value.includes('\u0000')) {
        eventId = value
      } else if (field === 'retry') {
        const retry = parseInt(value, 10)
        if (!Number.isNaN(retry)) {
          onParse({ type: 'reconnect-interval', value: retry })
        }
      }
    }
  }

  function hasBom(buffer: string) {
    return BOM.every(
      (charCode: number, index: number) => buffer.charCodeAt(index) === charCode
    )
  }

  /**
    TODO: Remove AbortError and just throw DOMException when targeting Node 18.
   */
  function getDOMException(errorMessage) {
    return globalThis.DOMException === undefined
      ? new AbortError(errorMessage)
      : new DOMException(errorMessage)
  }

  /**
    TODO: Remove below function and just 'reject(signal.reason)' when targeting Node 18.
   */
  function getAbortedReason(signal) {
    const reason =
      signal.reason === undefined
        ? getDOMException('This operation was aborted.')
        : signal.reason

    return reason instanceof Error ? reason : getDOMException(reason)
  }

  // @see https://github.com/sindresorhus/p-timeout
  function pTimeout<ValueType, ReturnType = ValueType>(
    promise: PromiseLike<ValueType>,
    options: PTimeoutTypes.Options<ReturnType>
  ): PTimeoutTypes.ClearablePromise<ValueType | ReturnType> {
    const {
      milliseconds,
      fallback,
      message,
      customTimers = { setTimeout, clearTimeout }
    } = options

    let timer: number

    const cancelablePromise = new Promise((resolve, reject) => {
      if (typeof milliseconds !== 'number' || Math.sign(milliseconds) !== 1) {
        throw new TypeError(
          `Expected \`milliseconds\` to be a positive number, got \`${milliseconds}\``
        )
      }

      if (milliseconds === Number.POSITIVE_INFINITY) {
        resolve(promise)
        return
      }

      if (options.signal) {
        const { signal } = options
        if (signal.aborted) {
          reject(getAbortedReason(signal))
        }

        signal.addEventListener('abort', () => {
          reject(getAbortedReason(signal))
        })
      }

      timer = customTimers.setTimeout.call(
        undefined,
        () => {
          if (fallback) {
            try {
              resolve(fallback())
            } catch (error) {
              reject(error)
            }

            return
          }

          const errorMessage =
            typeof message === 'string'
              ? message
              : `Promise timed out after ${milliseconds} milliseconds`
          const timeoutError =
            message instanceof Error ? message : new TimeoutError(errorMessage)

          if (typeof (promise as any).cancel === 'function') {
            ;(promise as any).cancel()
          }

          reject(timeoutError)
        },
        milliseconds
      )
      ;(async () => {
        try {
          resolve(await promise)
        } catch (error) {
          reject(error)
        } finally {
          customTimers.clearTimeout.call(undefined, timer)
        }
      })()
    })

    ;(cancelablePromise as any).clear = () => {
      customTimers.clearTimeout.call(undefined, timer)
      timer = undefined
    }

    return cancelablePromise as any
  }
}
