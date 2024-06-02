#!/usr/bin/env node
import 'dotenv/config'

import OpenAI from 'openai'
import { default as assert } from 'tiny-invariant'

import { WeatherClient } from '../../src/index.js'

async function main() {
  const weather = new WeatherClient()
  const openai = new OpenAI()

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: 'You are a helpful assistant. Be as concise as possible.'
    },
    { role: 'user', content: 'What is the weather in San Francisco?' }
  ]

  const res0 = await openai.chat.completions.create({
    messages,
    model: 'gpt-4o',
    temperature: 0,
    tools: weather.tools.specs,
    tool_choice: 'required'
  })
  const message0 = res0.choices[0]?.message!
  console.log(JSON.stringify(message0, null, 2))
  assert(message0.role === 'assistant')
  assert(message0.tool_calls?.[0]?.function?.name === 'get_current_weather')

  const getCurrentWeather = weather.tools.get('get_current_weather')!.function
  assert(getCurrentWeather)

  const toolParams = message0.tool_calls[0].function.arguments
  assert(typeof toolParams === 'string')
  const toolResult = await getCurrentWeather(toolParams)

  messages.push(message0)
  messages.push({
    role: 'tool',
    tool_call_id: message0.tool_calls[0].id,
    content: JSON.stringify(toolResult)
  })

  const res1 = await openai.chat.completions.create({
    messages,
    model: 'gpt-4o',
    temperature: 0,
    tools: weather.tools.specs
  })
  const message1 = res1.choices[0].message
  console.log(JSON.stringify(message1, null, 2))
}

await main()
