import dotenv from 'dotenv-safe'

import { ChatGPTAPI } from './chatgpt-api'

dotenv.config()

/**
 * Example CLI for testing functionality.
 */
async function main() {
  const api = new ChatGPTAPI({ sessionToken: process.env.SESSION_TOKEN })
  await api.ensureAuth()

  const response = await api.sendMessage(
    'Write a python version of bubble sort. Do not include example usage.'
  )

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
