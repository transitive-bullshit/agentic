import test from 'ava'

import { SlackClient } from '@/services/slack'

import '../_utils'

test('SlackClient.sendMessage', async (t) => {
  if (!process.env.SLACK_API_KEY || !process.env.SLACK_DEFAULT_CHANNEL) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new SlackClient()

  const result = await client.sendMessage({
    text: 'Hello World!'
  })
  t.truthy(result)
})

test('SlackClient.sendAndWaitForReply', async (t) => {
  if (!process.env.SLACK_API_KEY || !process.env.SLACK_DEFAULT_CHANNEL) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new SlackClient()

  await t.throwsAsync(
    async () => {
      await client.sendAndWaitForReply({
        text: 'Please reply to this message with "yes" or "no"',
        validate: () => false, // never validate so we timeout
        timeoutMs: 1000,
        intervalMs: 100
      })
    },
    {
      instanceOf: Error,
      message: 'Reached timeout waiting for reply'
    }
  )
})
