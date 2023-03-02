import KeyvRedis from '@keyv/redis'
import dotenv from 'dotenv-safe'
import Keyv from 'keyv'
import { oraPromise } from 'ora'

import { ChatGPTAPI, type ChatMessage } from '../src'

dotenv.config()

/**
 * Demo CLI for testing message persistence with redis.
 *
 * ```
 * npx tsx demos/demo-persistence.ts
 * ```
 */
async function main() {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
  const store = new KeyvRedis(redisUrl)
  const messageStore = new Keyv({ store, namespace: 'chatgpt-demo' })

  let res: ChatMessage

  {
    // create an initial conversation in one client
    const api = new ChatGPTAPI({
      apiKey: process.env.OPENAI_API_KEY,
      messageStore
    })

    const prompt = 'What are the top 5 anime of all time?'

    res = await oraPromise(api.sendMessage(prompt), {
      text: prompt
    })
    console.log('\n' + res.text + '\n')
  }

  {
    // follow up with a second client using the same underlying redis store
    const api = new ChatGPTAPI({
      apiKey: process.env.OPENAI_API_KEY,
      messageStore
    })

    const prompt = 'Can you give 5 more?'

    res = await oraPromise(
      api.sendMessage(prompt, {
        parentMessageId: res.id
      }),
      {
        text: prompt
      }
    )
    console.log('\n' + res.text + '\n')
  }

  // wait for redis to finish and then disconnect
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      messageStore.disconnect()
      resolve()
    }, 1000)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
