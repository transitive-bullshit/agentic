# Update December 12, 2022 <!-- omit in toc -->

Yesterday, OpenAI added additional Cloudflare protections that make it more difficult to access the unofficial API.

This package has been updated to use Puppeteer to automatically log in to ChatGPT and extract the necessary auth credentials. 🔥

To use the updated version, **make sure you're using the latest version of this package and Node.js >= 18**. Then update your code following the examples below, paying special attention to the sections on [Authentication](#authentication) and [Restrictions](#restrictions).

We're working hard to improve this process (especially CAPTCHA automation). Keep in mind that this package will be updated to use the official API as soon as it's released, so things should get much easier over time. 💪

Lastly, please consider starring this repo and <a href="https://twitter.com/transitive_bs">following me on twitter <img src="https://storage.googleapis.com/saasify-assets/twitter-logo.svg" alt="twitter" height="24px" align="center"></a> to help support the project.

Thanks && cheers,
Travis

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
  - [Authentication](#authentication)
    - [Restrictions](#restrictions)
- [Projects](#projects)
- [Compatibility](#compatibility)
- [Credits](#credits)
- [License](#license)

## Intro

This package is a Node.js wrapper around [ChatGPT](https://openai.com/blog/chatgpt) by [OpenAI](https://openai.com). TS batteries included. ✨

You can use it to start building projects powered by ChatGPT like chatbots, websites, etc...

## Install

```bash
npm install chatgpt puppeteer
```

`puppeteer` is an optional peer dependency used to automate bypassing the Cloudflare protections via `getOpenAIAuth`. The main API wrapper uses `fetch` directly.

## Usage

```ts
import { ChatGPTAPI, getOpenAIAuth } from 'chatgpt'

async function example() {
  // use puppeteer to bypass cloudflare (headful because of captchas)
  const openAIAuth = await getOpenAIAuth({
    email: process.env.OPENAI_EMAIL,
    password: process.env.OPENAI_PASSWORD
  })

  const api = new ChatGPTAPI({ ...openAIAuth })
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
const api = new ChatGPTAPI({ ...openAIAuth, markdown: false })
```

If you want to automatically track the conversation, you can use `ChatGPTAPI.getConversation()`:

```ts
const api = new ChatGPTAPI({ ...openAIAuth, markdown: false })

const conversation = api.getConversation()

// send a message and wait for the response
const response0 = await conversation.sendMessage('What is OpenAI?')

// send a follow-up
const response1 = await conversation.sendMessage('Can you expand on that?')

// send another follow-up
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
  const { ChatGPTAPI, getOpenAIAuth } = await import('chatgpt')

  const openAIAuth = await getOpenAIAuth({
    email: process.env.OPENAI_EMAIL,
    password: process.env.OPENAI_PASSWORD
  })

  const api = new ChatGPTAPI({ ...openAIAuth })
  await api.ensureAuth()

  const response = await api.sendMessage('Hello World!')
  console.log(response)
}
```

</details>

### Docs

See the [auto-generated docs](./docs/classes/ChatGPTAPI.md) for more info on methods and parameters.

### Demos

To run the included demos:

1. clone repo
2. install node deps
3. set `OPENAI_EMAIL` and `OPENAI_PASSWORD` in .env

A [basic demo](./demos/demo.ts) is included for testing purposes:

```bash
npx tsx demos/demo.ts
```

A [conversation demo](./demos/demo-conversation.ts) is also included:

```bash
npx tsx demos/demo-conversation.ts
```

### Authentication

On December 11, 2022, OpenAI added some additional Cloudflare protections which make it more difficult to access the unofficial API.

You'll need a valid OpenAI "session token" and Cloudflare "clearance token" in order to use the API.

We've provided an automated, Puppeteer-based solution `getOpenAIAuth` to fetch these for you, but you may still run into cases where you have to manually pass the CAPTCHA. We're working on a solution to automate this further.

You can also get these tokens manually, but keep in mind that the `clearanceToken` only lasts for max 2 hours.

<details>
<summary>Getting tokens manually</summary>

To get session token manually:

1. Go to https://chat.openai.com/chat and log in or sign up.
2. Open dev tools.
3. Open `Application` > `Cookies`.
   ![ChatGPT cookies](./media/session-token.png)
4. Copy the value for `__Secure-next-auth.session-token` and save it to your environment. This will be your `sessionToken`.
5. Copy the value for `cf_clearance` and save it to your environment. This will be your `clearanceToken`.
6. Copy the value of the `user-agent` header from any request in your `Network` tab. This will be your `userAgent`.

Pass `sessionToken`, `clearanceToken`, and `userAgent` to the `ChatGPTAPI` constructor.

</details>

> **Note**
> This package will switch to using the official API once it's released, which will make this process much simpler.

#### Restrictions

**Please read these carefully**

- You must use `node >= 18` at the moment. I'm using `v19.2.0` in my testing.
- Cloudflare `cf_clearance` **tokens expire after 2 hours**, so right now we recommend that you refresh your `cf_clearance` token every hour or so.
- Your `user-agent` and `IP address` **must match** from the real browser window you're logged in with to the one you're using for `ChatGPTAPI`.
  - This means that you currently can't log in with your laptop and then run the bot on a server or proxy somewhere.
- Cloudflare will still sometimes ask you to complete a CAPTCHA, so you may need to keep an eye on it and manually resolve the CAPTCHA. Automated CAPTCHA bypass is coming soon.
- You should not be using this account while the bot is using it, because that browser window may refresh one of your tokens and invalidate the bot's session.

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
- [Discord Bot #4 (selfbot)](https://github.com/0x7030676e31/cumsocket)
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
- [Lovelines.xyz](https://lovelines.xyz)
- [EXM smart contracts](https://github.com/decentldotland/molecule)
- [Flutter ChatGPT API](https://github.com/coskuncay/flutter_chatgpt_api)
- [Carik Bot](https://github.com/luridarmawan/Carik)
- [Github Action for reviewing PRs](https://github.com/kxxt/chatgpt-action/)
- [WhatsApp Bot #1](https://github.com/pascalroget/whatsgpt) (multi-user support)
- [WhatsApp Bot #2](https://github.com/amosayomide05/chatgpt-whatsapp-bot)
- [WhatsApp Bot #3](https://github.com/navopw/whatsapp-chatgpt)
- [Matrix Bot](https://github.com/jakecoppinger/matrix-chatgpt-bot)
- [Rental Cover Letter Generator](https://sharehouse.app/ai)
- [Assistant CLI](https://github.com/diciaup/assistant-cli)
- [Teams Bot](https://github.com/formulahendry/chatgpt-teams-bot)
- [Askai](https://github.com/yudax42/askai)

If you create a cool integration, feel free to open a PR and add it to the list.

## Compatibility

This package is ESM-only. It supports:

- Node.js >= 18
  - Node.js 17, 16, and 14 were supported in earlier versions, but OpenAI's Cloudflare update caused a bug with `undici` on v17 and v16 that needs investigation. So for now, use `node >= 18`
- We recommend against using `chatgpt` from client-side browser code because it would expose your private session token
- If you want to build a website using `chatgpt`, we recommend using it only from your backend API

## Credits

- Huge thanks to [@wong2](https://github.com/wong2), [@simon300000](https://github.com/simon300000), [@RomanHotsiy](https://github.com/RomanHotsiy), [@ElijahPepe](https://github.com/ElijahPepe), and all the other contributors 💪
- The original browser version was inspired by this [Go module](https://github.com/danielgross/whatsapp-gpt) by [Daniel Gross](https://github.com/danielgross)
- [OpenAI](https://openai.com) for creating [ChatGPT](https://openai.com/blog/chatgpt/) 🔥

## License

MIT © [Travis Fischer](https://transitivebullsh.it)

If you found this project interesting, please consider [sponsoring me](https://github.com/sponsors/transitive-bullshit) or <a href="https://twitter.com/transitive_bs">following me on twitter <img src="https://storage.googleapis.com/saasify-assets/twitter-logo.svg" alt="twitter" height="24px" align="center"></a>
