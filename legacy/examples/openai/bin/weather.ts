import 'dotenv/config'

import { assert } from '@agentic/core'
import { WeatherClient } from '@agentic/stdlib'
import OpenAI from 'openai'

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

  {
    // First call to OpenAI to invoke the weather tool
    const res = await openai.chat.completions.create({
      messages,
      model: 'gpt-4o-mini',
      temperature: 0,
      tools: weather.functions.toolSpecs,
      tool_choice: 'required'
    })
    const message = res.choices[0]?.message!
    console.log(JSON.stringify(message, null, 2))
    assert(message.tool_calls?.[0]?.function?.name === 'get_current_weather')

    const fn = weather.functions.get('get_current_weather')!
    assert(fn)

    const toolParams = message.tool_calls[0].function.arguments
    const toolResult = await fn(toolParams)

    messages.push(message)
    messages.push({
      role: 'tool',
      tool_call_id: message.tool_calls[0].id,
      content: JSON.stringify(toolResult)
    })
  }

  {
    // Second call to OpenAI to generate a text response
    const res = await openai.chat.completions.create({
      messages,
      model: 'gpt-4o-mini',
      temperature: 0,
      tools: weather.functions.toolSpecs
    })
    const message = res.choices?.[0]?.message
    console.log(JSON.stringify(message, null, 2))
  }
}

await main()
