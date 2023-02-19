import dotenv from 'dotenv-safe'
import { oraPromise } from 'ora'

import { ChatGPTUnofficialProxyAPI } from '../src'

dotenv.config()

/**
 * Demo for testing conversation support using a reverse proxy which provides
 * access to the unofficial ChatGPT API.
 *
 * ```
 * npx tsx demos/demo-reverse-proxy.ts
 * ```
 */
async function main() {
  // WARNING: this method will expose your access token to a third-party. Please be
  // aware of the risks before using this method.
  const api = new ChatGPTUnofficialProxyAPI({
    // optionally override the default reverse proxy URL (or use one of your own...)
    // apiReverseProxyUrl: 'https://chat.duti.tech/api/conversation',
    // apiReverseProxyUrl: 'https://gpt.pawan.krd/backend-api/conversation',

    // change this to an `accessToken` extracted from the ChatGPT site's `https://chat.openai.com/api/auth/session` response
    // or use https://github.com/acheong08/OpenAIAuth to get the token programatically (python)
    accessToken: process.env.OPENAI_ACCESS_TOKEN,

    // optionally override the default model (this must be a chatgpt model; not an OpenAI model)
    // model: 'text-davinci-002-render-sha' // default model for free and paid users (used to be called turbo in the UI)
    // model: 'text-davinci-002-render-paid' // legacy paid model

    debug: false
  })

  const prompt = 'Write a poem about cats.'

  let res = await oraPromise(api.sendMessage(prompt), {
    text: prompt
  })

  console.log('\n' + res.text + '\n')

  const prompt2 = 'Can you make it cuter and shorter?'

  res = await oraPromise(
    api.sendMessage(prompt2, {
      conversationId: res.conversationId,
      parentMessageId: res.id
    }),
    {
      text: prompt2
    }
  )
  console.log('\n' + res.text + '\n')

  const prompt3 = 'Now write it in French.'

  res = await oraPromise(
    api.sendMessage(prompt3, {
      conversationId: res.conversationId,
      parentMessageId: res.id
    }),
    {
      text: prompt3
    }
  )
  console.log('\n' + res.text + '\n')

  const prompt4 = 'What were we talking about again?'

  res = await oraPromise(
    api.sendMessage(prompt4, {
      conversationId: res.conversationId,
      parentMessageId: res.id
    }),
    {
      text: prompt4
    }
  )
  console.log('\n' + res.text + '\n')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
