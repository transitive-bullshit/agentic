import dotenv from 'dotenv-safe'
import { oraPromise } from 'ora'

import { ChatGPTAPI } from '../src'

dotenv.config()

/**
 * Demo CLI for testing conversation support using a reverse proxy that mimic's.
 * OpenAI's completions API ChatGPT's unofficial API.
 *
 * ```
 * npx tsx demos/demo-reverse-proxy.ts
 * ```
 */
async function main() {
  const api = new ChatGPTAPI({
    // rate limit of 15 requests per 15 seconds
    apiReverseProxyUrl: 'https://chatgpt.pawan.krd/api/completions',
    // change this to an `accessToken` extracted from the ChatGPT site's `https://chat.openai.com/api/auth/session` response
    apiKey: process.env.OPENAI_ACCESS_TOKEN,
    completionParams: {
      // override this depending on the ChatGPT model you want to use
      // NOTE: if you are on a paid plan, you can't use the free model and vice-versa
      // model: 'text-davinci-002-render' // free, default model
      model: 'text-davinci-002-render-paid' // paid, default model
      // model: 'text-davinci-002-render-sha' // paid, turbo model
    },
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
