import dotenv from 'dotenv-safe'
import { oraPromise } from 'ora'

import { ChatGPTAPIBrowser } from '../src'

dotenv.config()

/**
 * Demo CLI for testing basic functionality.
 *
 * ```
 * npx tsx demos/demo.ts
 * ```
 */
async function main() {
  const email = process.env.OPENAI_EMAIL
  const password = process.env.OPENAI_PASSWORD

  const api = new ChatGPTAPIBrowser({
    email,
    password,
    debug: false,
    minimize: true
  })
  await api.initSession()

  const prompt =
    'Write a python version of bubble sort. Do not include example usage.'

  const res = await oraPromise(api.sendMessage(prompt), {
    text: prompt
  })
  console.log(res.response)

  // close the browser at the end
  await api.closeSession()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
