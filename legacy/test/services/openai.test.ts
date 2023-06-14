import test from 'ava'

import * as types from '@/types'

import { createOpenAITestClient } from '../_utils'

test('OpenAIClient - createChatCompletion - functions', async (t) => {
  const openai = createOpenAITestClient()

  const model = 'gpt-3.5-turbo-0613'
  const messages: types.ChatMessage[] = [
    {
      role: 'user',
      content: 'What’s the weather like in Boston right now?'
    }
  ]
  const functions = [
    {
      name: 'get_current_weather',
      description: 'Get the current weather in a given location',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The city and state, e.g. San Francisco, CA'
          },
          unit: {
            type: 'string',
            enum: ['celsius', 'fahrenheit']
          }
        },
        required: ['location']
      }
    }
  ]

  const res0 = await openai.createChatCompletion({
    model,
    messages,
    functions
  })

  // console.log(JSON.stringify(res0, null, 2))
  t.is(res0.message.role, 'assistant')
  t.is(res0.message.content as any, null)
  t.is(res0.message.function_call!.name, 'get_current_weather')

  const args = JSON.parse(res0.message.function_call!.arguments)
  t.deepEqual(args, { location: 'Boston' })

  const weatherMock = { temperature: 22, unit: 'celsius', description: 'Sunny' }

  const res1 = await openai.createChatCompletion({
    model,
    messages: [
      ...messages,
      res0.message,
      {
        role: 'function',
        name: 'get_current_weather',
        content: JSON.stringify(weatherMock)
      }
    ],
    functions
  })

  // console.log(JSON.stringify(res1, null, 2))
  t.is(res1.message.role, 'assistant')
  t.true(res1.message.content.length > 0)
  t.is(res1.message.function_call, undefined)
})
