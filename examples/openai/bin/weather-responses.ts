import 'dotenv/config'

import type { ResponseInput } from 'openai/resources/responses/responses.mjs'
import { assert } from '@agentic/core'
import { WeatherClient } from '@agentic/stdlib'
import OpenAI from 'openai'

async function main() {
  const weather = new WeatherClient()
  const openai = new OpenAI()

  const messages: ResponseInput = [
    {
      role: 'system',
      content: 'You are a helpful assistant. Be as concise as possible.'
    },
    { role: 'user', content: 'What is the weather in San Francisco?' }
  ]

  {
    // First call to OpenAI to invoke the weather tool
    const res = await openai.responses.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      tools: weather.functions.responsesToolSpecs,
      tool_choice: 'required',
      input: messages
    })

    const message = res.output[0]
    console.log(JSON.stringify(message, null, 2))
    assert(message?.type === 'function_call')
    assert(message.name === 'get_current_weather')

    const fn = weather.functions.get('get_current_weather')!
    assert(fn)
    const toolResult = await fn(message.arguments)

    messages.push(message)
    messages.push({
      type: 'function_call_output',
      call_id: message.call_id,
      output: JSON.stringify(toolResult)
    })
  }

  console.log()

  {
    // Second call to OpenAI to generate a text response
    const res = await openai.responses.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      tools: weather.functions.specs,
      input: messages
    })

    console.log(res.output_text)
  }
}

await main()
