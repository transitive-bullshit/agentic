import dotenv from 'dotenv-safe'
import { oraPromise } from 'ora'

import { ChatGPTAPIBrowser } from '../src'

dotenv.config()

/**
 * Demo CLI for testing conversation support.
 *
 * ```
 * npx tsx demos/demo-conversation-browser.ts
 * ```
 */
async function main() {
  const email = process.env.OPENAI_EMAIL
  const password = process.env.OPENAI_PASSWORD

  const api = new ChatGPTAPIBrowser({ email, password, debug: true })
  await api.init()

  const prompt = 'What is OpenAI?'

  const response = await oraPromise(api.sendMessage(prompt), {
    text: prompt
  })

  console.log(response)

  const prompt2 = 'Did they made OpenGPT?'

  console.log(
    await oraPromise(api.sendMessage(prompt2), {
      text: prompt2
    })
  )

  const prompt3 = 'Who founded this institute?'

  console.log(
    await oraPromise(api.sendMessage(prompt3), {
      text: prompt3
    })
  )

  const prompt4 = 'Who is that?'

  console.log(
    await oraPromise(api.sendMessage(prompt4), {
      text: prompt4
    })
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
