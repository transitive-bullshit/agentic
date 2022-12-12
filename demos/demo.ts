import dotenv from 'dotenv-safe'
import { oraPromise } from 'ora'

import { ChatGPTAPI, getOpenAIAuth } from '../src'

dotenv.config()

/**
 * Demo CLI for testing basic functionality.
 *
 * ```
 * npx tsx src/demo.ts
 * ```
 */
async function main() {
  const email = process.env.EMAIL
  const password = process.env.PASSWORD

  const authInfo = await getOpenAIAuth({
    email,
    password
  })

  const api = new ChatGPTAPI({ ...authInfo })
  await api.ensureAuth()

  const prompt =
    'Write a python version of bubble sort. Do not include example usage.'

  const response = await oraPromise(api.sendMessage(prompt), {
    text: prompt
  })

  return response
}

main()
  .then((res) => {
    console.log(res)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
