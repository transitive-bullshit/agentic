import test from 'ava'
// import 'dotenv/config'
import { expectTypeOf } from 'expect-type'
import { z } from 'zod'

import { OpenAIChatModelBuilder } from '../src/openai'
import { createOpenAITestClient } from './_utils'

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
