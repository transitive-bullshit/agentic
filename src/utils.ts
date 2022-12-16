import type {
  EventSourceParseCallback,
  EventSourceParser
} from 'eventsource-parser'
import type { Page } from 'puppeteer'
import { remark } from 'remark'
import stripMarkdown from 'strip-markdown'

import * as types from './types'

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
  let pathname

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
  body: types.ConversationJSONBody
): Promise<types.ChatError | types.ChatResponse> {
  const BOM = [239, 187, 191]

  // Workaround for https://github.com/esbuild-kit/tsx/issues/113
  globalThis.__name = () => undefined

  let conversationId: string = body?.conversation_id
  let messageId: string = body?.messages?.[0]?.id
  let response = ''

  try {
    console.log('browserPostEventStream', url, accessToken, body)

    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        accept: 'text/event-stream',
        'x-openai-assistant-app-id': '',
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json'
      }
    })

    console.log('EVENT', res)

    if (!res.ok) {
      return {
        error: {
          message: `ChatGPTAPI error ${res.status || res.statusText}`,
          statusCode: res.status,
          statusText: res.statusText
        },
        response: null,
        conversationId,
        messageId
      }
    }

    return await new Promise<types.ChatResponse>(async (resolve, reject) => {
      function onMessage(data: string) {
        if (data === '[DONE]') {
          return resolve({
            error: null,
            response,
            conversationId,
            messageId
          })
        }

        try {
          const parsedData: types.ConversationResponseEvent = JSON.parse(data)
          if (parsedData.conversation_id) {
            conversationId = parsedData.conversation_id
          }

          if (parsedData.message?.id) {
            messageId = parsedData.message.id
          }

          const partialResponse = parsedData.message?.content?.parts?.[0]
          if (partialResponse) {
            response = partialResponse
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
    })
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
        error: null,
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
      response: null,
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
}
