import test from 'ava'
import { expectTypeOf } from 'expect-type'
import { z } from 'zod'

import { CalculatorTool, WeatherTool } from '@/index'

import { createTestAgenticRuntime } from '../_utils'

// TODO: callWithMetadata and verify sub-tool calls

test('OpenAIChatCompletion - tools - calculator', async (t) => {
  t.timeout(2 * 60 * 1000)
  const agentic = createTestAgenticRuntime()

  const result = await agentic
    .gpt3('What is 5 * 50?')
    .tools([new CalculatorTool()])
    .output(
      z.object({
        answer: z.number()
      })
    )
    .call()

  t.truthy(typeof result === 'object')
  t.truthy(typeof result.answer === 'number')
  t.is(result.answer, 250)

  expectTypeOf(result).toMatchTypeOf<{
    answer: number
  }>()
})

test('OpenAIChatCompletion - tools - weather', async (t) => {
  if (!process.env.WEATHER_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const agentic = createTestAgenticRuntime()

  const result = await agentic
    .gpt3('What is the temperature in san francisco today?')
    .tools([new CalculatorTool({ agentic }), new WeatherTool({ agentic })])
    .output(
      z.object({
        answer: z.number(),
        units: z.union([z.literal('fahrenheit'), z.literal('celcius')])
      })
    )
    .call()

  t.truthy(typeof result === 'object')
  t.truthy(typeof result.answer === 'number')
  t.truthy(typeof result.units === 'string')

  expectTypeOf(result).toMatchTypeOf<{
    answer: number
    units: 'fahrenheit' | 'celcius'
  }>()
})
