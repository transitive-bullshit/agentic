import test from 'ava'

import { TwilioConversationClient } from '@/services/twilio-conversation'

import '../_utils'

test.serial('TwilioConversationClient.createConversation', async (t) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return t.pass()
  }

  const client = new TwilioConversationClient()

  const friendlyName = 'create-conversation-test'
  const conversation = await client.createConversation(friendlyName)
  t.is(conversation.friendly_name, friendlyName)

  await client.deleteConversation(conversation.sid)
})

test.serial('TwilioConversationClient.addParticipant', async (t) => {
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_TEST_PHONE_NUMBER
  ) {
    return t.pass()
  }

  const client = new TwilioConversationClient()

  const { sid: conversationSid } = await client.createConversation(
    'add-participant-test'
  )
  const { sid: participantSid } = await client.addParticipant({
    conversationSid,
    recipientPhoneNumber: process.env.TWILIO_TEST_PHONE_NUMBER
  })
  t.is(participantSid.startsWith('MB'), true)

  await client.deleteConversation(conversationSid)
})

test.serial('TwilioConversationClient.sendMessage', async (t) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return t.pass()
  }

  const client = new TwilioConversationClient()

  const text = 'Hello, world!'
  const { sid: conversationSid } = await client.createConversation(
    'send-message-test'
  )
  const message = await client.sendMessage({ conversationSid, text })
  t.is(message.body, text)

  await client.deleteConversation(conversationSid)
})

test.serial('TwilioConversationClient.sendTextWithChunking', async (t) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return t.pass()
  }

  const client = new TwilioConversationClient()

  const { sid: conversationSid } = await client.createConversation(
    'send-message-test'
  )

  const text =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

  const messages = await client.sendTextWithChunking({ conversationSid, text })

  // Text should be sent in two messages:
  t.true(text.startsWith(messages[0].body))
  t.true(text.endsWith(messages[1].body))

  await client.deleteConversation(conversationSid)
})

test.serial('TwilioConversationClient.fetchMessages', async (t) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return t.pass()
  }

  const client = new TwilioConversationClient()

  const { sid: conversationSid } = await client.createConversation(
    'fetch-messages-test'
  )
  const { messages, meta } = await client.fetchMessages(conversationSid)
  t.true(Array.isArray(messages))
  t.is(meta.page, 0)

  await client.deleteConversation(conversationSid)
})

test.serial('TwilioConversationClient.sendAndWaitForReply', async (t) => {
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_TEST_PHONE_NUMBER
  ) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new TwilioConversationClient()

  await t.throwsAsync(
    async () => {
      await client.sendAndWaitForReply({
        recipientPhoneNumber: process.env.TWILIO_TEST_PHONE_NUMBER!,
        text: 'Please confirm by replying with "yes" or "no".',
        name: 'wait-for-reply-test',
        validate: (message) =>
          ['yes', 'no'].includes(message.body.toLowerCase()),
        timeoutMs: 10000, // 10 seconds
        intervalMs: 5000 // 5 seconds
      })
    },
    {
      instanceOf: Error,
      message: 'Twilio timeout waiting for reply'
    }
  )
})

test.serial(
  'TwilioConversationClient.sendAndWaitForReply.stopSignal',
  async (t) => {
    if (
      !process.env.TWILIO_ACCOUNT_SID ||
      !process.env.TWILIO_AUTH_TOKEN ||
      !process.env.TWILIO_TEST_PHONE_NUMBER
    ) {
      return t.pass()
    }

    t.timeout(2 * 60 * 1000)
    const client = new TwilioConversationClient()

    await t.throwsAsync(
      async () => {
        const controller = new AbortController()
        const promise = client.sendAndWaitForReply({
          recipientPhoneNumber: process.env.TWILIO_TEST_PHONE_NUMBER!,
          text: 'Please confirm by replying with "yes" or "no".',
          name: 'wait-for-reply-test',
          validate: (message) =>
            ['yes', 'no'].includes(message.body.toLowerCase()),
          timeoutMs: 10000, // 10 seconds
          intervalMs: 5000, // 5 seconds
          stopSignal: controller.signal
        })
        controller.abort('Aborted')
        return promise
      },
      {
        instanceOf: Error,
        message: 'Aborted'
      }
    )
  }
)
