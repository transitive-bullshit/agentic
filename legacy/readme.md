<p align="center">
  <img alt="Example usage" src="/media/demo.gif">
</p>

# ChatGPT API <!-- omit in toc -->

> Node.js client for the unofficial [ChatGPT](https://openai.com/blog/chatgpt/) API.

[![NPM](https://img.shields.io/npm/v/chatgpt.svg)](https://www.npmjs.com/package/chatgpt) [![Build Status](https://github.com/transitive-bullshit/chatgpt-api/actions/workflows/test.yml/badge.svg)](https://github.com/transitive-bullshit/chatgpt-api/actions/workflows/test.yml) [![MIT License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/transitive-bullshit/chatgpt-api/blob/main/license) [![Prettier Code Formatting](https://img.shields.io/badge/code_style-prettier-brightgreen.svg)](https://prettier.io)

- [Intro](#intro)
- [Install](#install)
- [Usage](#usage)
  - [Docs](#docs)
  - [Demos](#demos)
  - [Session Tokens](#session-tokens)
- [Projects](#projects)
- [Compatibility](#compatibility)
- [Credits](#credits)
- [License](#license)

## Intro

This package is a Node.js wrapper around [ChatGPT](https://openai.com/blog/chatgpt) by [OpenAI](https://openai.com). TS batteries included. ✨

You can use it to start building projects powered by ChatGPT like chatbots, websites, etc...

## Install

```bash
npm install chatgpt
```

## Usage

```ts
import { ChatGPTAPI } from 'chatgpt'

async function example() {
  // sessionToken is required; see below for details
  const api = new ChatGPTAPI({
    sessionToken: process.env.SESSION_TOKEN
  })

  // ensure the API is properly authenticated
  await api.ensureAuth()

  // send a message and wait for the response
  const response = await api.sendMessage(
    'Write a python version of bubble sort.'
  )

  // response is a markdown-formatted string
  console.log(response)
}
```

ChatGPT responses are formatted as markdown by default. If you want to work with plaintext instead, you can use:

```ts
const api = new ChatGPTAPI({
  sessionToken: process.env.SESSION_TOKEN,
  markdown: false
})
```

If you want to automatically track the conversation, you can use `ChatGPTAPI.getConversation()`:

```ts
const api = new ChatGPTAPI({
  sessionToken: process.env.SESSION_TOKEN
})

const conversation = api.getConversation()

// send a message and wait for the response
const response0 = await conversation.sendMessage('What is OpenAI?')

// send a follow-up prompt to the previous message and wait for the response
const response1 = await conversation.sendMessage('Can you expand on that?')

// send another follow-up to the same conversation
const response2 = await conversation.sendMessage('Oh cool; thank you')
```

Sometimes, ChatGPT will hang for an extended period of time before beginning to respond. This may be due to rate limiting or it may be due to OpenAI's servers being overloaded.

To mitigate these issues, you can add a timeout like this:

```ts
// timeout after 2 minutes (which will also abort the underlying HTTP request)
const response = await api.sendMessage('this is a timeout test', {
  timeoutMs: 2 * 60 * 1000
})
```

You can stream responses using the `onProgress` or `onConversationResponse` callbacks. See the [docs](./docs/classes/ChatGPTAPI.md) for more details.

<details>
<summary>Usage in CommonJS (Dynamic import)</summary>

```js
async function example() {
  // To use ESM in CommonJS, you can use a dynamic import
  const { ChatGPTAPI } = await import('chatgpt')

  const api = new ChatGPTAPI({
    sessionToken: process.env.SESSION_TOKEN
  })
  await api.ensureAuth()

  const response = await api.sendMessage('Hello World!')
  console.log(response)
}
```

</details>

### Docs

See the [auto-generated docs](./docs/classes/ChatGPTAPI.md) for more info on methods and parameters.

### Demos

A [basic demo](./src/demo.ts) is included for testing purposes:

```bash
# 1. clone repo
# 2. install node deps
# 3. set `SESSION_TOKEN` in .env
# 4. run:
npx tsx src/demo.ts
```

A [conversation demo](./src/demo-conversation.ts) is also included:

```bash
# 1. clone repo
# 2. install node deps
# 3. set `SESSION_TOKEN` in .env
# 4. run:
npx tsx src/demo-conversation.ts
```

### Session Tokens

**This package requires a valid session token from ChatGPT to access it's unofficial REST API.**

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

## Projects

All of these awesome projects are built using the `chatgpt` package. 🤯

- [Twitter Bot](https://github.com/transitive-bullshit/chatgpt-twitter-bot) powered by ChatGPT ✨
  - Mention [@ChatGPTBot](https://twitter.com/ChatGPTBot) on Twitter with your prompt to try it out
- [Chrome Extension](https://github.com/gragland/chatgpt-everywhere) ([demo](https://twitter.com/gabe_ragland/status/1599466486422470656))
- [VSCode Extension #1](https://github.com/mpociot/chatgpt-vscode) ([demo](https://twitter.com/marcelpociot/status/1599180144551526400), [updated version](https://github.com/timkmecl/chatgpt-vscode), [marketplace](https://marketplace.visualstudio.com/items?itemName=timkmecl.chatgpt))
- [VSCode Extension #2](https://github.com/barnesoir/chatgpt-vscode-plugin) ([marketplace](https://marketplace.visualstudio.com/items?itemName=JayBarnes.chatgpt-vscode-plugin))
- [VSCode Extension #3](https://github.com/gencay/vscode-chatgpt) ([marketplace](https://marketplace.visualstudio.com/items?itemName=gencay.vscode-chatgpt))
- [Raycast Extension #1](https://github.com/abielzulio/chatgpt-raycast) ([demo](https://twitter.com/abielzulio/status/1600176002042191875))
- [Raycast Extension #2](https://github.com/domnantas/raycast-chatgpt)
- [Telegram Bot #1](https://github.com/realies/chatgpt-telegram-bot)
- [Telegram Bot #2](https://github.com/dawangraoming/chatgpt-telegram-bot)
- [Deno Telegram Bot](https://github.com/Ciyou/chatbot-telegram)
- [Go Telegram Bot](https://github.com/m1guelpf/chatgpt-telegram)
- [GitHub ProBot](https://github.com/oceanlvr/ChatGPTBot)
- [Discord Bot #1](https://github.com/onury5506/Discord-ChatGPT-Bot)
- [Discord Bot #2](https://github.com/Nageld/ChatGPT-Bot)
- [Discord Bot #3](https://github.com/leinstay/gptbot)
- [Discord bot #4 (selfbot)](https://github.com/0x7030676e31/cumsocket)
- [WeChat Bot #1](https://github.com/AutumnWhj/ChatGPT-wechat-bot)
- [WeChat Bot #2](https://github.com/fuergaosi233/wechat-chatgpt)
- [WeChat Bot #3](https://github.com/wangrongding/wechat-bot)
- [WeChat Bot #4](https://github.com/darknightlab/wechat-bot)
- [WeChat Bot #5](https://github.com/sunshanpeng/wechaty-chatgpt)
- [QQ Bot (plugin for Yunzai-bot)](https://github.com/ikechan8370/chatgpt-plugin)
- [QQ Bot (plugin for KiviBot)](https://github.com/KiviBotLab/kivibot-plugin-chatgpt)
- [QQ Bot (oicq)](https://github.com/easydu2002/chat_gpt_oicq)
- [QQ Bot (oicq + RabbitMQ)](https://github.com/linsyking/ChatGPT-QQBot)
- [Lovelines.xyz](https://lovelines.xyz)
- [EXM smart contracts](https://github.com/decentldotland/molecule)
- [Flutter ChatGPT API](https://github.com/coskuncay/flutter_chatgpt_api)
- [Carik Bot](https://github.com/luridarmawan/Carik)
- [Github Action for reviewing PRs](https://github.com/kxxt/chatgpt-action/)
- [WhatsApp Bot](https://github.com/amosayomide05/chatgpt-whatsapp-bot)
- [Matrix Bot](https://github.com/jakecoppinger/matrix-chatgpt-bot)
- [Rental Cover Letter Generator](https://sharehouse.app/ai)
- [Assistant CLI](https://github.com/diciaup/assistant-cli)

If you create a cool integration, feel free to open a PR and add it to the list.

## Compatibility

This package is ESM-only. It supports:

- Node.js >= 16.8
  - If you need Node.js 14 support, use [`v1.4.0`](https://github.com/transitive-bullshit/chatgpt-api/releases/tag/v1.4.0)
- Edge runtimes like CF workers and Vercel edge functions
- Modern browsers
  - Mainly meant for chrome extensions where your code is protected to a degree
  - We recommend against using `chatgpt` from client-side browser code because it would expose your private session token
  - If you want to build a website using `chatgpt`, we recommend using it only from your backend API

## Credits

- Huge thanks to [@simon300000](https://github.com/simon300000), [@RomanHotsiy](https://github.com/RomanHotsiy), [@ElijahPepe](https://github.com/ElijahPepe), and all the other contributors 💪
- The original browser version was inspired by this [Go module](https://github.com/danielgross/whatsapp-gpt) by [Daniel Gross](https://github.com/danielgross)
- The original REST version was inspired by [chat-gpt-google-extension](https://github.com/wong2/chat-gpt-google-extension) by [@wong2](https://github.com/wong2)
- [OpenAI](https://openai.com) for creating [ChatGPT](https://openai.com/blog/chatgpt/) 🔥

## License

MIT © [Travis Fischer](https://transitivebullsh.it)

If you found this project interesting, please consider [sponsoring me](https://github.com/sponsors/transitive-bullshit) or <a href="https://twitter.com/transitive_bs">following me on twitter <img src="https://storage.googleapis.com/saasify-assets/twitter-logo.svg" alt="twitter" height="24px" align="center"></a>
