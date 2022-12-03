# ChatGPT API <!-- omit in toc -->

> Node.js TS wrapper around [ChatGPT](https://openai.com/blog/chatgpt/). Uses headless Chrome until the official API is released.

[![NPM](https://img.shields.io/npm/v/chatgpt.svg)](https://www.npmjs.com/package/chatgpt) [![Build Status](https://github.com/transitive-bullshit/chatgpt-api/actions/workflows/test.yml/badge.svg)](https://github.com/transitive-bullshit/chatgpt-api/actions/workflows/test.yml) [![MIT License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/transitive-bullshit/chatgpt-api/blob/main/license) [![Prettier Code Formatting](https://img.shields.io/badge/code_style-prettier-brightgreen.svg)](https://prettier.io)

- [Intro](#intro)
- [Auth](#auth)
- [Usage](#usage)
- [Example](#example)
- [Docs](#docs)
- [Todo](#todo)
- [Related](#related)
- [License](#license)

## Intro

This package is a Node.js TypeScript wrapper around [ChatGPT](https://openai.com/blog/chatgpt) by [OpenAI](https://openai.com).

You can use it to start experimenting with ChatGPT by integrating it into websites, chatbots, etc...

## Auth

It uses headless Chromium via [Playwright](https://playwright.dev), so **you still need to have access to ChatGPT**, but it makes it much easier to access programatically.

Chromium is opened in non-headless mode by default, which is important because the first time you run `ChatGPTAPI.init()`, you'll need to log in manually. We launch Chromium with a persistent context, so you shouldn't need to keep re-logging in after the first time.

## Usage

```ts
import { ChatGPTAPI } from 'chatgpt'

async function example() {
  const api = new ChatGPTAPI()

  // open chromium and wait until the user has logged in
  await api.init({ auth: 'blocking' })

  // send a message and wait for a complete response, then parse it as markdown
  const response = await api.sendMessage(
    'Write a python version of bubble sort. Do not include example usage.'
  )
  console.log(response)
}
```

Which outputs a similar reponse to this (as a markdown string, including the _\`\`\`python_ code block prefix):

```python
def bubble_sort(lst):
  # Set the initial flag to True to start the loop
  swapped = True

  # Keep looping until there are no more swaps
  while swapped:
    # Set the flag to False initially
    swapped = False

    # Loop through the list
    for i in range(len(lst) - 1):
      # If the current element is greater than the next element,
      # swap them and set the flag to True
      if lst[i] > lst[i + 1]:
        lst[i], lst[i + 1] = lst[i + 1], lst[i]
        swapped = True

  # Return the sorted list
  return lst
```

The default functionality is to parse ChatGPT responses as markdown using [html-to-md](https://github.com/stonehank/html-to-md). I've found the markdown parsing to work really well during my testing, but if you'd rather output plaintext, you can use:

```ts
const api = new ChatGPTAPI({ markdown: false })
```

## Example

A full [example](./src/example.ts) is included for testing purposes:

```
npx tsx src/example.ts
```

## Docs

See the [auto-generated docs](./docs/classes/ChatGPTAPI.md) for more info on methods parameters.

## Todo

- [ ] Add message and conversation IDs
- [ ] Add support for streaming responses
- [ ] Add basic unit tests

## Related

- Inspired by this [Go module](https://github.com/danielgross/whatsapp-gpt) by [Daniel Gross](https://github.com/danielgross)
- [Python port](https://github.com/taranjeet/chatgpt-api)

## License

MIT © [Travis Fischer](https://transitivebullsh.it)

Support my open source work by <a href="https://twitter.com/transitive_bs">following me on twitter <img src="https://storage.googleapis.com/saasify-assets/twitter-logo.svg" alt="twitter" height="24px" align="center"></a>
