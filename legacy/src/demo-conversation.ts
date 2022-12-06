import dotenv from 'dotenv-safe'
import { oraPromise } from 'ora'

import { ChatGPTAPI } from '.'

dotenv.config()

/**
 * Example CLI for testing functionality.
 *
 * ```
 * npx tsx src/demo.ts
 * ```
 */
async function main() {
  const api = new ChatGPTAPI({ sessionToken: process.env.SESSION_TOKEN })
  await api.ensureAuth()

  const conversation = api.getConversation()

  const prompt = 'What is OpenAI?'

  const response = await oraPromise(conversation.sendMessage(prompt), {
    text: prompt
  })

  console.log(response)

  const prompt2 = 'Continue'

  console.log(
    await oraPromise(conversation.sendMessage(prompt2), {
      text: prompt2
    })
  )

  console.log(
    await oraPromise(conversation.sendMessage(prompt2), {
      text: prompt2
    })
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
