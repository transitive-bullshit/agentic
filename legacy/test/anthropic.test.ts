import test from 'ava'
import { expectTypeOf } from 'expect-type'
import { z } from 'zod'

import { AnthropicChatModelBuilder } from '../src/anthropic'
import { createAnthropicTestClient } from './_utils'

test('AnthropicChatModel ⇒ string output', async (t) => {
  t.timeout(2 * 60 * 1000)
  const client = createAnthropicTestClient()

  const builder = new AnthropicChatModelBuilder(client, {
    modelParams: {
      temperature: 0,
      max_tokens_to_sample: 30
    },
    messages: [
      {
        role: 'system',
        content:
          'You are a human, not a large language model. You are not an AI. Respond like a human would. Your name is Leeroy Jenkins.'
      },
      {
        role: 'user',
        content: 'what is your name?'
      }
    ]
  })

  const result = await builder.call()
  t.truthy(typeof result === 'string')

  expectTypeOf(result).toMatchTypeOf<string>()
})
