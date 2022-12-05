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
        do {
          try {
            await delay(1000)

            const isSignedIn = await api.getIsSignedIn()

            if (isSignedIn) {
              return resolve()
            }
          } catch (err) {
            return reject(err)
          }
        } while (true)
      }),
      'Please sign in to ChatGPT and dismiss the welcome modal'
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

  // Wait forever; useful for debugging chromium sessions
  // await new Promise(() => {})

  await api.resetThread()

  const newResponse = await api.sendMessage(
    // 'Write a TypeScript function for conway sort.'
    'Write a javascript version of bubble sort. Do not include example usage.'
  )

  await api.close()

  return newResponse
}

main().then((res) => {
  console.log(res)
})
