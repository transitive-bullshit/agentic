# Update February 1, 2023 <!-- omit in toc -->

This package no longer requires any browser hacks – **it is now using the official OpenAI API** with a leaked, unofficial ChatGPT model. 🔥

```ts
import { ChatGPTAPI } from 'chatgpt'

const api = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY
})

const res = await api.sendMessage('Hello World!')
console.log(res.text)
```

The updated solution is significantly more lightweight and robust compared with previous versions. You also don't have to worry about IP issues or rate limiting!

If you run into any issues, we do have a pretty active [Discord](https://discord.gg/v9gERj825w) with a bunch of ChatGPT hackers from the Node.js & Python communities.

Lastly, please consider starring this repo and <a href="https://twitter.com/transitive_bs">following me on twitter <img src="https://storage.googleapis.com/saasify-assets/twitter-logo.svg" alt="twitter" height="24px" align="center"></a> to help support the project.

Thanks && cheers,
[Travis](https://twitter.com/transitive_bs)

---

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

Sign up for an [OpenAI API key](https://platform.openai.com/overview) and store it in your environment.

```ts
import { ChatGPTAPI } from 'chatgpt'

async function example() {
  const api = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY
  })

  const res = await api.sendMessage('Hello World!')
  console.log(res.text)
}
```

If you want to track the conversation, use the `conversationId` and `id` in the result object, and pass them to `sendMessage` as `conversationId` and `parentMessageId` respectively.

```ts
const api = new ChatGPTAPI({ apiKey: process.env.OPENAI_API_KEY })

// send a message and wait for the response
let res = await api.sendMessage('What is OpenAI?')
console.log(res.text)

// send a follow-up
res = await api.sendMessage('Can you expand on that?', {
  conversationId: res.conversationId,
  parentMessageId: res.id
})
console.log(res.text)

// send another follow-up
// send a follow-up
res = await api.sendMessage('What were we talking about?', {
  conversationId: res.conversationId,
  parentMessageId: res.id
})
console.log(res.text)
```

You can add streaming via the `onProgress` handler:

```ts
// timeout after 2 minutes (which will also abort the underlying HTTP request)
const res = await api.sendMessage('Write me a 500 word essay on frogs.', {
  onProgress: (partialResponse) => console.log(partialResponse)
})
```

You can add a timeout using the `timeoutMs` option:

```ts
// timeout after 2 minutes (which will also abort the underlying HTTP request)
const response = await api.sendMessage('this is a timeout test', {
  timeoutMs: 2 * 60 * 1000
})
```

<details>
<summary>Usage in CommonJS (Dynamic import)</summary>

```js
async function example() {
  // To use ESM in CommonJS, you can use a dynamic import
  const { ChatGPTAPI } = await import('chatgpt')

  const api = new ChatGPTAPI({ apiKey: process.env.OPENAI_API_KEY })

  const res = await api.sendMessage('Hello World!')
  console.log(res.text)
}
```

</details>

### Docs

See the [auto-generated docs](./docs/classes/ChatGPTAPI.md) for more info on methods and parameters. Here are the [docs](./docs/classes/ChatGPTAPI.md) for the browser-based version.

### Demos

To run the included demos:

1. clone repo
2. install node deps
3. set `OPENAI_API_KEY` in .env

A [basic demo](./demos/demo.ts) is included for testing purposes:

```bash
npx tsx demos/demo.ts
```

A [demo showing on progress handler](./demos/demo-on-progress.ts):

```bash
npx tsx demos/demo-on-progress.ts
```

The on progress demo uses the optional `onProgress` parameter to `sendMessage` to receive intermediary results as ChatGPT is "typing".

A [conversation demo](./demos/demo-conversation.ts):

```bash
npx tsx demos/demo-conversation.ts
```

Lastly, a [persitence demo](./demos/demo-persistence.ts) shows how to store messages in Redis for persistence:

```bash
npx tsx demos/demo-conversation.ts
```

Any [keyv adaptor](https://github.com/jaredwray/keyv) is supported for persistence, and there are overrides if you'd like to use a different way of storing / retrieving messages.

Note that persisting message is very important for remembering the context of previous conversations.

## Projects

All of these awesome projects are built using the `chatgpt` package. 🤯

- [Twitter Bot](https://github.com/transitive-bullshit/chatgpt-twitter-bot) powered by ChatGPT ✨
  - Mention [@ChatGPTBot](https://twitter.com/ChatGPTBot) on Twitter with your prompt to try it out
- [ChatGPT API Server](https://github.com/waylaidwanderer/node-chatgpt-api) - API server for this package with support for multiple OpenAI accounts, proxies, and load-balancing requests between accounts.
- [Lovelines.xyz](https://lovelines.xyz?ref=chatgpt-api)
- [Chrome Extension](https://github.com/gragland/chatgpt-everywhere) ([demo](https://twitter.com/gabe_ragland/status/1599466486422470656))
- [VSCode Extension #1](https://github.com/mpociot/chatgpt-vscode) ([demo](https://twitter.com/marcelpociot/status/1599180144551526400), [updated version](https://github.com/timkmecl/chatgpt-vscode), [marketplace](https://marketplace.visualstudio.com/items?itemName=timkmecl.chatgpt))
- [VSCode Extension #2](https://github.com/barnesoir/chatgpt-vscode-plugin) ([marketplace](https://marketplace.visualstudio.com/items?itemName=JayBarnes.chatgpt-vscode-plugin))
- [VSCode Extension #3](https://github.com/gencay/vscode-chatgpt) ([marketplace](https://marketplace.visualstudio.com/items?itemName=gencay.vscode-chatgpt))
- [VSCode Extension #4](https://github.com/dogukanakkaya/chatgpt-code-vscode-extension) ([marketplace](https://marketplace.visualstudio.com/items?itemName=dogukanakkaya.chatgpt-code))
- [Raycast Extension #1](https://github.com/abielzulio/chatgpt-raycast) ([demo](https://twitter.com/abielzulio/status/1600176002042191875))
- [Raycast Extension #2](https://github.com/domnantas/raycast-chatgpt)
- [Telegram Bot #1](https://github.com/realies/chatgpt-telegram-bot)
- [Telegram Bot #2](https://github.com/dawangraoming/chatgpt-telegram-bot)
- [Telegram Bot #3](https://github.com/RainEggplant/chatgpt-telegram-bot) (group privacy mode, ID-based auth)
- [Telegram Bot #4](https://github.com/ArdaGnsrn/chatgpt-telegram) (queue system, ID-based chat thread)
- [Deno Telegram Bot](https://github.com/Ciyou/chatbot-telegram)
- [Go Telegram Bot](https://github.com/m1guelpf/chatgpt-telegram)
- [Telegram Bot for YouTube Summaries](https://github.com/codextde/youtube-summary)
- [GitHub ProBot](https://github.com/oceanlvr/ChatGPTBot)
- [Discord Bot #1](https://github.com/onury5506/Discord-ChatGPT-Bot)
- [Discord Bot #2](https://github.com/Nageld/ChatGPT-Bot)
- [Discord Bot #3](https://github.com/leinstay/gptbot)
- [Discord Bot #4 (selfbot)](https://github.com/0x7030676e31/cumsocket)
- [Discord Bot #5](https://github.com/itskdhere/ChatGPT-Discord-BOT)
- [Discord Bot #6 (Shakespeare bot)](https://gist.github.com/TheBrokenRail/4b37e7c44e8f721d8bd845050d034c16)
- [WeChat Bot #1](https://github.com/AutumnWhj/ChatGPT-wechat-bot)
- [WeChat Bot #2](https://github.com/fuergaosi233/wechat-chatgpt)
- [WeChat Bot #3](https://github.com/wangrongding/wechat-bot)
- [WeChat Bot #4](https://github.com/darknightlab/wechat-bot)
- [WeChat Bot #5](https://github.com/sunshanpeng/wechaty-chatgpt)
- [QQ Bot (plugin for Yunzai-bot)](https://github.com/ikechan8370/chatgpt-plugin)
- [QQ Bot (plugin for KiviBot)](https://github.com/KiviBotLab/kivibot-plugin-chatgpt)
- [QQ Bot (oicq)](https://github.com/easydu2002/chat_gpt_oicq)
- [QQ Bot (oicq + RabbitMQ)](https://github.com/linsyking/ChatGPT-QQBot)
- [QQ Bot (go-cqhttp)](https://github.com/PairZhu/ChatGPT-QQRobot)
- [EXM smart contracts](https://github.com/decentldotland/molecule)
- [Flutter ChatGPT API](https://github.com/coskuncay/flutter_chatgpt_api)
- [Carik Bot](https://github.com/luridarmawan/Carik)
- [Github Action for reviewing PRs](https://github.com/kxxt/chatgpt-action/)
- [WhatsApp Bot #1](https://github.com/pascalroget/whatsgpt) (multi-user support)
- [WhatsApp Bot #2](https://github.com/amosayomide05/chatgpt-whatsapp-bot)
- [WhatsApp Bot #3](https://github.com/navopw/whatsapp-chatgpt)
- [WhatsApp Bot #4](https://github.com/noelzappy/chatgpt-whatsapp) (schedule periodic messages)
- [Matrix Bot](https://github.com/matrixgpt/matrix-chatgpt-bot)
- [Rental Cover Letter Generator](https://sharehouse.app/ai)
- [Assistant CLI](https://github.com/diciaup/assistant-cli)
- [Teams Bot](https://github.com/formulahendry/chatgpt-teams-bot)
- [Askai](https://github.com/yudax42/askai)
- [TalkGPT](https://github.com/ShadovvBeast/TalkGPT)
- [ChatGPT With Voice](https://github.com/thanhsonng/chatgpt-voice)
- [iOS Shortcut](https://github.com/leecobaby/shortcuts/blob/master/other/ChatGPT_EN.md)
- [Slack Bot #1](https://github.com/trietphm/chatgpt-slackbot/)
- [Slack Bot #2](https://github.com/lokwkin/chatgpt-slackbot-node/) (with queueing mechanism)
- [Electron Bot](https://github.com/ShiranAbir/chaty)
- [Kodyfire CLI](https://github.com/nooqta/chatgpt-kodyfire)
- [Twitch Bot](https://github.com/BennyDeeDev/chatgpt-twitch-bot)
- [Continuous Conversation](https://github.com/DanielTerletzkiy/chat-gtp-assistant)
- [Figma plugin](https://github.com/frederickk/chatgpt-figma-plugin)
- [NestJS server](https://github.com/RusDyn/chatgpt_nestjs_server)
- [NestJS ChatGPT Starter Boilerplate](https://github.com/mitkodkn/nestjs-chatgpt-starter)
- [Wordsmith: Add-in for Microsoft Word](https://github.com/xtremehpx/Wordsmith)
- [QuizGPT: Create Kahoot quizzes with ChatGPT](https://github.com/Kladdy/quizgpt)

If you create a cool integration, feel free to open a PR and add it to the list.

## Compatibility

- This package is ESM-only.
- This package supports `node >= 14`.
- This module assumes that `fetch` is installed.
  - In `node >= 18`, it's installed by default.
  - In `node < 18`, you need to install a polyfill like `unfetch/polyfill` ([guide](https://github.com/developit/unfetch#usage-as-a-polyfill))
- If you want to build a website using `chatgpt`, we recommend using it only from your backend API

## Credits

- Huge thanks to [@waylaidwanderer](https://github.com/waylaidwanderer), [@abacaj](https://github.com/abacaj), [@wong2](https://github.com/wong2), [@simon300000](https://github.com/simon300000), [@RomanHotsiy](https://github.com/RomanHotsiy), [@ElijahPepe](https://github.com/ElijahPepe), and all the other contributors 💪
- The original browser version was inspired by this [Go module](https://github.com/danielgross/whatsapp-gpt) by [Daniel Gross](https://github.com/danielgross)
- [OpenAI](https://openai.com) for creating [ChatGPT](https://openai.com/blog/chatgpt/) 🔥

## License

MIT © [Travis Fischer](https://transitivebullsh.it)

If you found this project interesting, please consider [sponsoring me](https://github.com/sponsors/transitive-bullshit) or <a href="https://twitter.com/transitive_bs">following me on twitter <img src="https://storage.googleapis.com/saasify-assets/twitter-logo.svg" alt="twitter" height="24px" align="center"></a>
