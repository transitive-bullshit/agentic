<p align="center">
  <img alt="Example usage" src="/media/demo.gif">
</p>

# ChatGPT API <!-- omit in toc -->

> Node.js client for the unofficial [ChatGPT](https://openai.com/blog/chatgpt/) API.

[![NPM](https://img.shields.io/npm/v/chatgpt.svg)](https://www.npmjs.com/package/chatgpt) [![Build Status](https://github.com/transitive-bullshit/chatgpt-api/actions/workflows/test.yml/badge.svg)](https://github.com/transitive-bullshit/chatgpt-api/actions/workflows/test.yml) [![MIT License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/transitive-bullshit/chatgpt-api/blob/main/license) [![Prettier Code Formatting](https://img.shields.io/badge/code_style-prettier-brightgreen.svg)](https://prettier.io)

- [Intro](#intro)
- [How it works](#how-it-works)
- [Install](#install)
- [Usage](#usage)
- [Docs](#docs)
- [Examples](#examples)
- [Credit](#credit)
- [License](#license)

## Intro

This package is a Node.js wrapper around [ChatGPT](https://openai.com/blog/chatgpt) by [OpenAI](https://openai.com). TS batteries included. ✨

You can use it to start building projects powered by ChatGPT like chatbots, websites, etc...

## How it works

This package requires a valid session token from ChatGPT to access it's unofficial REST API.

To get a session token:

1. Go to https://chat.openai.com/chat and log in or sign up.
2. Open dev tools.
3. Open `Application` > `Cookies`.
   ![ChatGPT cookies](./media/session-token.png)
4. Copy the value for `__Secure-next-auth.session-token` and save it to your environment.

If you want to run the built-in demo, store this value as `SESSION_TOKEN` in a local `.env` file.

> **Note**
> This package will switch to using the official API once it's released.

> **Note**
> Prior to v1.0.0, this package used a headless browser via [Playwright](https://playwright.dev/) to automate the web UI. Here are the [docs for the initial browser version](https://github.com/transitive-bullshit/chatgpt-api/tree/v0.4.2).

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
  const api = new ChatGPTAPI({ sessionToken: process.env.SESSION_TOKEN })

  // ensure the API is properly authenticated (optional)
  await api.ensureAuth()

  // send a message and wait for the response
  const response = await api.sendMessage(
    'Write a python version of bubble sort. Do not include example usage.'
  )

  // response is a markdown-formatted string
  console.log(response)
}
```

By default, the response will be formatted as markdown. If you want to work with plaintext only, you can use:

```ts
const api = new ChatGPTAPI({
  sessionToken: process.env.SESSION_TOKEN,
  markdown: false
})
```

A full [example](./src/example.ts) is included for testing purposes:

```bash
# 1. clone repo
# 2. install node deps
# 3. set `SESSION_TOKEN` in .env
# 4. run:
npx tsx src/example.ts
```

## Docs

See the [auto-generated docs](./docs/classes/ChatGPTAPI.md) for more info on methods and parameters.

## Examples

All of these awesome projects use the `chatgpt` package. 🤯

- [Twitter Bot](https://github.com/transitive-bullshit/chatgpt-twitter-bot) powered by ChatGPT ✨
  - Mention [@ChatGPTBot](https://twitter.com/ChatGPTBot) on Twitter with your prompt to try it out
- [Chrome Extension](https://github.com/gragland/chatgpt-everywhere) ([demo](https://twitter.com/gabe_ragland/status/1599466486422470656))
- [VSCode Extension](https://github.com/mpociot/chatgpt-vscode) ([demo](https://twitter.com/marcelpociot/status/1599180144551526400))
- [Go Telegram Bot](https://github.com/m1guelpf/chatgpt-telegram)
- [GitHub ProBot](https://github.com/oceanlvr/ChatGPTBot)
- [Lovelines.xyz](https://lovelines.xyz)

If you create a cool integration, feel free to open a PR and add it to the list.

## Credit

- Huge thanks to [@RomanHotsiy](https://github.com/RomanHotsiy), [@ElijahPepe](https://github.com/ElijahPepe), [@wong2](https://github.com/wong2), and all the other contributors 💪
- The original browser version was inspired by this [Go module](https://github.com/danielgross/whatsapp-gpt) by [Daniel Gross](https://github.com/danielgross)

## License

MIT © [Travis Fischer](https://transitivebullsh.it)

If you found this project interesting, please consider supporting my open source work by [sponsoring me](https://github.com/sponsors/transitive-bullshit) or <a href="https://twitter.com/transitive_bs">following me on twitter <img src="https://storage.googleapis.com/saasify-assets/twitter-logo.svg" alt="twitter" height="24px" align="center"></a>
