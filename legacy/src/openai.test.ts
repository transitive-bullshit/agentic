import test from 'ava'
import { expectTypeOf } from 'expect-type'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { OpenAIChatModelBuilder } from './openai'

const client = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })

test('OpenAIChatModel ⇒ json output', async (t) => {
  const builder = new OpenAIChatModelBuilder(client, {
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
