chatgpt / [Exports](modules.md)

# ChatGPT API <!-- omit in toc -->

> Node.js wrapper around [ChatGPT](https://openai.com/blog/chatgpt/). Uses headless Chrome as a temporary solution until the official API is released.

[![NPM](https://img.shields.io/npm/v/chatgpt.svg)](https://www.npmjs.com/package/chatgpt) [![Build Status](https://github.com/transitive-bullshit/chatgpt-api/actions/workflows/test.yml/badge.svg)](https://github.com/transitive-bullshit/chatgpt-api/actions/workflows/test.yml) [![MIT License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/transitive-bullshit/chatgpt-api/blob/main/license) [![Prettier Code Formatting](https://img.shields.io/badge/code_style-prettier-brightgreen.svg)](https://prettier.io)

- [Intro](#intro)
- [Auth](#auth)
- [Usage](#usage)
- [Docs](#docs)
- [Todo](#todo)
- [Related](#related)
- [License](#license)

## Intro

This package is a Node.js TypeScript wrapper around [ChatGPT](https://openai.com/blog/chatgpt) by [OpenAI](https://openai.com).

## Auth

It uses headless Chromium via [Playwright](https://playwright.dev) under the hood, so **you still need to have access to ChatGPT**, but it makes it much easier to build experiments with until OpenAPI's official API for ChatGPT is released.

The first time you run `ChatGPTAPI`.init, Chromium will be opened in non-headless mode so you can log in manually. After the first time, Chromium is launched with a persistent context, so you shouldn't need to keep re-logging in.

## Usage

```ts
async function example() {
const api = new ChatGPTAPI()

// open chromium and wait until the user has logged in
await api.init({ auth: 'blocking' })

// send a message and wait for a complete response, then parse it as markdown
const response = await api.sendMessage(
  'Write a python version of bubble sort. Do not include example usage.'
)

/* // response
Here is an implementation of bubble sort in Python:

\`\`\`python
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
\`\`\`
*/
```

Here's the same response rendered as markdown:

Here is an implementation of bubble sort in Python:

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

Note that the default functionality is to parse ChatGPT responses as markdown using [html-to-md](https://github.com/stonehank/html-to-md). I've found the markdown quality to be excellent in my testing, but if you'd rather output plaintext, just pass `{ markdown: false }` to the `ChatGPTAPI` constructor.

## Docs

See the [auto-generated docs](./docs/modules.md).

## Todo

- [ ] Add message and conversation IDs
- [ ] Add support for streaming responses

## Related

- Inspired by the [Go module](https://github.com/danielgross/whatsapp-gpt) by [Daniel Gross](https://github.com/danielgross)

## License

MIT © [Travis Fischer](https://transitivebullsh.it)

Support my open source work by <a href="https://twitter.com/transitive_bs">following me on twitter <img src="https://storage.googleapis.com/saasify-assets/twitter-logo.svg" alt="twitter" height="24px" align="center"></a>
