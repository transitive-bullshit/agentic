import test from 'ava'
import dotenv from 'dotenv-safe'

import { ChatGPTAPI } from './chatgpt-api'

dotenv.config()

const isCI = !!process.env.CI

test('ChatGPTAPI invalid session token', async (t) => {
  t.timeout(30 * 1000) // 30 seconds

  t.throws(() => new ChatGPTAPI({ sessionToken: null }), {
    message: 'ChatGPT invalid session token'
  })

  await t.throwsAsync(
    async () => {
      const chatgpt = new ChatGPTAPI({ sessionToken: 'invalid' })
      await chatgpt.ensureAuth()
    },
    {
      message: 'ChatGPT failed to refresh auth token. Error: Unauthorized'
    }
  )
})

test('ChatGPTAPI valid session token', async (t) => {
  if (!isCI) {
    t.timeout(2 * 60 * 1000) // 2 minutes
  }

  t.notThrows(
    () => new ChatGPTAPI({ sessionToken: 'fake valid session token' })
  )

  await t.notThrowsAsync(
    (async () => {
      const api = new ChatGPTAPI({ sessionToken: process.env.SESSION_TOKEN })

      // Don't make any real API calls using our session token if we're running on CI
      if (!isCI) {
        await api.ensureAuth()
        const response = await api.sendMessage('test')
        console.log('chatgpt response', response)

        t.truthy(response)
        t.is(typeof response, 'string')
      }
    })()
  )
})

if (!isCI) {
  test('ChatGPTAPI expired session token', async (t) => {
    t.timeout(30 * 1000) // 30 seconds
    const expiredSessionToken = process.env.TEST_EXPIRED_SESSION_TOKEN

    await t.throwsAsync(
      async () => {
        const chatgpt = new ChatGPTAPI({ sessionToken: expiredSessionToken })
        await chatgpt.ensureAuth()
      },
      {
        message:
          'ChatGPT failed to refresh auth token. Error: session token may have expired'
      }
    )
  })
}
