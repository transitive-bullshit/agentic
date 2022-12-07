import { createParser } from 'eventsource-parser'

import { fetch } from './fetch'
import { streamAsyncIterable } from './stream-async-iterable'

export async function fetchSSE(
  url: string,
  options: Parameters<typeof fetch>[1] & { onMessage: (data: string) => void }
) {
  const { onMessage, ...fetchOptions } = options
  const res = await fetch(url, fetchOptions)
  if (!res.ok) {
    throw new Error(`ChatGPTAPI error ${res.status || res.statusText}`)
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
