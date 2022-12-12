import dotenv from 'dotenv-safe'
import { oraPromise } from 'ora'

import { ChatGPTAPI } from '../src'
import { getOpenAIAuthInfo } from './openai-auth-puppeteer'

dotenv.config()

/**
 * Demo CLI for testing conversation support.
 *
 * ```
 * npx tsx src/demo-conversation.ts
 * ```
 */
async function main() {
  const email = process.env.EMAIL
  const password = process.env.PASSWORD

  const authInfo = await getOpenAIAuthInfo({
    email,
    password
  })

  const api = new ChatGPTAPI({ ...authInfo })
  await api.ensureAuth()

  const conversation = api.getConversation()

  const prompt = 'What is OpenAI?'

  const response = await oraPromise(conversation.sendMessage(prompt), {
    text: prompt
  })

  console.log(response)

  const prompt2 = 'Did they made OpenGPT?'

  console.log(
    await oraPromise(conversation.sendMessage(prompt2), {
      text: prompt2
    })
  )

  const prompt3 = 'Who founded this institute?'

  console.log(
    await oraPromise(conversation.sendMessage(prompt3), {
      text: prompt3
    })
  )

  const prompt4 = 'Who is that?'

  console.log(
    await oraPromise(conversation.sendMessage(prompt4), {
      text: prompt4
    })
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
