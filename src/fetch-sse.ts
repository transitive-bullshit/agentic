import { createParser } from 'eventsource-parser'

import { fetch } from './fetch'

// import { streamAsyncIterable } from './stream-async-iterable'

export async function fetchSSE(
  url: string,
  options: Parameters<typeof fetch>[1] & { onMessage: (data: string) => void }
) {
  const { onMessage, ...fetchOptions } = options
  const resp = await fetch(url, fetchOptions)
  const parser = createParser((event) => {
    if (event.type === 'event') {
      onMessage(event.data)
    }
  })

  resp.body.on('readable', () => {
    let chunk: string | Buffer
    while (null !== (chunk = resp.body.read())) {
      parser.feed(chunk.toString())
    }
  })

  // TODO: add support for web-compatible `fetch`
  // for await (const chunk of streamAsyncIterable(resp.body)) {
  //   const str = new TextDecoder().decode(chunk)
  //   parser.feed(str)
  // }
}
