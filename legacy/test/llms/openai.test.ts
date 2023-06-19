import test from 'ava'
import { expectTypeOf } from 'expect-type'
import sinon from 'sinon'
import { z } from 'zod'

import { OutputValidationError, TemplateValidationError } from '@/errors'
import { BaseChatCompletion, OpenAIChatCompletion } from '@/llms'

import { createTestAgenticRuntime } from '../_utils'

test('OpenAIChatCompletion ⇒ types', async (t) => {
  const agentic = createTestAgenticRuntime()
  const b = agentic.gpt4('test')
  t.pass()

  expectTypeOf(b).toMatchTypeOf<OpenAIChatCompletion<any, string>>()

  expectTypeOf(
    b.input(
      z.object({
        foo: z.string()
      })
    )
  ).toMatchTypeOf<
    BaseChatCompletion<
      {
        foo: string
      },
      string
    >
  >()

  expectTypeOf(
    b.output(
      z.object({
        bar: z.string().optional()
      })
    )
  ).toMatchTypeOf<
    BaseChatCompletion<
      any,
      {
        bar?: string
      }
    >
  >()
})

test('OpenAIChatCompletion ⇒ string output', async (t) => {
  t.timeout(2 * 60 * 1000)
  const agentic = createTestAgenticRuntime()

  const builder = new OpenAIChatCompletion({
    agentic,
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

test('OpenAIChatCompletion ⇒ json output', async (t) => {
  t.timeout(2 * 60 * 1000)
  const agentic = createTestAgenticRuntime()

  const builder = new OpenAIChatCompletion({
    agentic,
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

test('OpenAIChatCompletion ⇒ boolean output', async (t) => {
  t.timeout(2 * 60 * 1000)
  const agentic = createTestAgenticRuntime()

  const builder = new OpenAIChatCompletion({
    agentic,
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

test('OpenAIChatCompletion ⇒ retry logic', async (t) => {
  t.timeout(2 * 60 * 1000)
  const agentic = createTestAgenticRuntime()

  const builder = new OpenAIChatCompletion({
    agentic,
    modelParams: {
      temperature: 0,
      max_tokens: 30
    },
    retryConfig: {
      retries: 2
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

  const fakeCall = sinon.fake.rejects(new OutputValidationError('test'))
  sinon.replace(builder as any, '_call', fakeCall)

  await t.throwsAsync(() => builder.call(), {
    instanceOf: OutputValidationError,
    name: 'OutputValidationError',
    message: 'test'
  })
  t.is(fakeCall.callCount, 3)
})

test('OpenAIChatCompletion ⇒ template variables', async (t) => {
  t.timeout(2 * 60 * 1000)
  const agentic = createTestAgenticRuntime()

  const query = agentic
    .gpt3(`Give me {{numFacts}} random facts about {{topic}}`)
    .input(
      z.object({
        topic: z.string(),
        numFacts: z.number().int().default(5)
      })
    )
    .output(z.object({ facts: z.array(z.string()) }))
    .modelParams({ temperature: 0.5 })

  const res0 = await query.call({ topic: 'cats' })

  t.true(Array.isArray(res0.facts))
  t.is(res0.facts.length, 5)
  expectTypeOf(res0).toMatchTypeOf<{ facts: string[] }>()

  for (const fact of res0.facts) {
    t.true(typeof fact === 'string')
  }

  const res1 = await query.call({ topic: 'dogs', numFacts: 2 })

  t.true(Array.isArray(res1.facts))
  t.is(res1.facts.length, 2)
  expectTypeOf(res1).toMatchTypeOf<{ facts: string[] }>()

  for (const fact of res1.facts) {
    t.true(typeof fact === 'string')
  }
})

test('OpenAIChatCompletion ⇒ missing template variable', async (t) => {
  t.timeout(2 * 60 * 1000)
  const agentic = createTestAgenticRuntime()

  const builder = agentic
    .gpt3(`Give me {{numFacts}} random facts about {{topic}}`)
    .input(
      z.object({
        topic: z.string(),
        numFacts: z.number().int().default(5).optional()
      })
    )
    .output(z.object({ facts: z.array(z.string()) }))
    .modelParams({ temperature: 0.5 })

  await t.throwsAsync(() => builder.call({ topic: 'cats' }), {
    instanceOf: TemplateValidationError,
    name: 'TemplateValidationError',
    message: 'Template error: "numFacts" not defined in input - 1:10'
  })
})

test('OpenAIChatCompletion ⇒ function inputs', async (t) => {
  t.timeout(2 * 60 * 1000)
  const agentic = createTestAgenticRuntime()

  const builder = new OpenAIChatCompletion({
    agentic,
    modelParams: {
      temperature: 0,
      max_tokens: 30
    },
    messages: [
      {
        role: 'user',
        content: (input) => `tell me about ${input.topic}`
      }
    ]
  })
    .input(z.object({ topic: z.string() }))
    .output(z.string())

  const result = await builder.call({ topic: 'cats' })
  t.truthy(typeof result === 'string')

  expectTypeOf(result).toMatchTypeOf<string>()
})
