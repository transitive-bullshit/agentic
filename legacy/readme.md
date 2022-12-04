# ChatGPT API <!-- omit in toc -->

> Node.js wrapper around [ChatGPT](https://openai.com/blog/chatgpt/). Uses headless Chrome until the official API is released.

[![NPM](https://img.shields.io/npm/v/chatgpt.svg)](https://www.npmjs.com/package/chatgpt) [![Build Status](https://github.com/transitive-bullshit/chatgpt-api/actions/workflows/test.yml/badge.svg)](https://github.com/transitive-bullshit/chatgpt-api/actions/workflows/test.yml) [![MIT License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/transitive-bullshit/chatgpt-api/blob/main/license) [![Prettier Code Formatting](https://img.shields.io/badge/code_style-prettier-brightgreen.svg)](https://prettier.io)

- [Intro](#intro)
- [How it works](#how-it-works)
- [Install](#install)
- [Usage](#usage)
- [Docs](#docs)
- [Examples](#examples)
- [Related](#related)
- [License](#license)

## Intro

This package is a Node.js wrapper around [ChatGPT](https://openai.com/blog/chatgpt) by [OpenAI](https://openai.com). TS batteries included. ✨

You can use it to start building projects powered by ChatGPT like chatbots, websites, etc...

## How it works

It uses headless Chromium via [Playwright](https://playwright.dev) to automate the webapp, so **you still need to have access to ChatGPT**. It just makes building API-like integrations much easier.

Chromium will be opened in non-headless mode by default, which is important because the first time you run `ChatGPTAPI.init()`, you'll need to log in manually. We launch Chromium with a persistent session, however, so you shouldn't need to keep re-logging in after the first time.

When you log in the first time, we recommend dismissing the welcome modal so you can watch the progress. This isn't strictly necessary, but it helps to understand what's going on.

- [Demo video](https://www.loom.com/share/0c44525b07354d679f30c45d8eec6271) showing how the initial auth flow works (29 seconds)
- [Demo video](https://www.loom.com/share/98e712dbddf843289e2b6615095bbdd7) showing how it works if you're already authed (13 seconds)

> **Note**
> We'll replace headless chrome with the official API once it's released.

## Install

```bash
npm install --save chatgpt
# or
yarn add chatgpt
# or
pnpm add chatgpt
```

## Usage

```ts
import { ChatGPTAPI } from 'chatgpt'

async function example() {
  const api = new ChatGPTAPI()

  // open chromium and wait until you've logged in
  await api.init({ auth: 'blocking' })

  // send a message and wait for the response
  const response = await api.sendMessage(
    'Write a python version of bubble sort. Do not include example usage.'
  )

  // response is a markdown-formatted string
  console.log(response)
}
```

By default, ChatGPT responses are parsed as markdown using [html-to-md](https://github.com/stonehank/html-to-md). I've found that this works really well during my testing, but if you'd rather output plaintext, you can use:

```ts
const api = new ChatGPTAPI({ markdown: false })
```

A full [example](./src/example.ts) is included for testing purposes:

```bash
# clone repo
# install node deps
# then run
npx tsx src/example.ts
```

## Docs

See the [auto-generated docs](./docs/classes/ChatGPTAPI.md) for more info on methods and parameters.

## Examples

- [Twitter Bot](https://github.com/transitive-bullshit/chatgpt-twitter-bot) - Twitter bot powered by this package.
  - Mention [@ChatGPTBot](https://twitter.com/ChatGPTBot) on Twitter with your prompt to try it out
- [VSCode extension](https://github.com/mpociot/chatgpt-vscode) ([demo](https://twitter.com/marcelpociot/status/1599180144551526400))
- [Go Telegram bot](https://github.com/m1guelpf/chatgpt-telegram)

## Related

- Inspired by this [Go module](https://github.com/danielgross/whatsapp-gpt) by [Daniel Gross](https://github.com/danielgross)
- [Python port](https://github.com/taranjeet/chatgpt-api)

## License

MIT © [Travis Fischer](https://transitivebullsh.it)

Support my open source work by <a href="https://twitter.com/transitive_bs">following me on twitter <img src="https://storage.googleapis.com/saasify-assets/twitter-logo.svg" alt="twitter" height="24px" align="center"></a>
