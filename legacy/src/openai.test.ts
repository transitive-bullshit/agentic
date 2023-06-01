import test from 'ava'
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
  type verify = Expect<
    Equal<
      typeof result,
      {
        foo: string
        bar: number
      }
    >
  >
})

// Ensure parsed results are typed correctly
// https://github.com/total-typescript/zod-tutorial/blob/main/src/helpers/type-utils.ts
type Expect<T extends true> = T
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y
  ? 1
  : 2
  ? true
  : false
