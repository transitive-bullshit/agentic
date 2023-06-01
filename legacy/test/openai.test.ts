import test from 'ava'
import { expectTypeOf } from 'expect-type'
import { z } from 'zod'

import { OpenAIChatModelBuilder } from '../src/openai'
import { createOpenAITestClient } from './_utils'

test('OpenAIChatModel ⇒ string output', async (t) => {
  t.timeout(2 * 60 * 1000)
  const client = createOpenAITestClient()

  const builder = new OpenAIChatModelBuilder(client, {
    modelParams: {
      temperature: 0,
      max_tokens: 30
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

  const result2 = await builder.output(z.string()).call()
  t.truthy(typeof result2 === 'string')

  expectTypeOf(result2).toMatchTypeOf<string>()
})

test('OpenAIChatModel ⇒ json output', async (t) => {
  t.timeout(2 * 60 * 1000)
  const client = createOpenAITestClient()

  const builder = new OpenAIChatModelBuilder(client, {
    modelParams: {
      temperature: 0.5
    },
    messages: [
      {
        role: 'user',
        content: 'generate fake data'
      }
    ]
  }).output(z.object({ foo: z.string(), bar: z.number() }))

  const result = await builder.call()
  t.truthy(result)
  t.truthy(typeof result.foo === 'string')
  t.truthy(typeof result.bar === 'number')
  t.is(Object.keys(result).length, 2)

  expectTypeOf(result).toMatchTypeOf<{ foo: string; bar: number }>()
})

test('OpenAIChatModel ⇒ boolean output', async (t) => {
  t.timeout(2 * 60 * 1000)
  const client = createOpenAITestClient()

  const builder = new OpenAIChatModelBuilder(client, {
    modelParams: {
      temperature: 0,
      max_tokens: 30
    },
    messages: [
      {
        role: 'user',
        content: 'are you alive?'
      }
    ]
  }).output(z.boolean())

  const result = await builder.call()
  t.truthy(typeof result === 'boolean')

  expectTypeOf(result).toMatchTypeOf<boolean>()
})
