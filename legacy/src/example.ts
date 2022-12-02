import delay from 'delay'
import { oraPromise } from 'ora'

import { ChatGPTAPI } from './chatgpt-api'

/**
 * Example CLI for testing functionality.
 */
async function main() {
  const api = new ChatGPTAPI()
  await api.init()

  const isSignedIn = await api.getIsSignedIn()

  if (!isSignedIn) {
    // Wait until the user signs in via the chromium browser
    await oraPromise(
      new Promise<void>(async (resolve, reject) => {
        try {
          await delay(1000)
          const isSignedIn = await api.getIsSignedIn()
          if (isSignedIn) {
            return resolve()
          }
        } catch (err) {
          return reject(err)
        }
      }),
      'Please sign in to ChatGPT'
    )
  }

  const response = await api.sendMessage(
    // 'Write a TypeScript function for conway sort.'
    'Write a python version of bubble sort. Do not include example usage.'
  )
  // const prompts = await api.getPrompts()
  // const messages = await api.getMessages()
  // console.log('prompts', prompts)
  // console.log('messages', messages)

  // Wait forever; useful for debugging chromium session
  // await new Promise(() => {})

  await api.close()

  return response
}

main().then((res) => {
  console.log(res)
})
