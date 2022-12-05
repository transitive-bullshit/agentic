import dotenv from 'dotenv-safe'
import { oraPromise } from 'ora'

import { ChatGPTAPI } from './src'

dotenv.config()

/**
 * Example CLI for testing functionality.
 */
async function main() {
  const api = new ChatGPTAPI({ sessionToken: process.env.SESSION_TOKEN })
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
