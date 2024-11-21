import 'dotenv/config'

import { createAISDKTools } from '@agentic/ai-sdk'
import { WeatherClient } from '@agentic/weather'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

async function main() {
  const weather = new WeatherClient()
  const openai = createOpenAI({ compatibility: 'strict' })

  const result = await generateText({
    model: openai('gpt-4o-mini'),
    tools: createAISDKTools(weather),
    toolChoice: 'required',
    temperature: 0,
    system: 'You are a helpful assistant. Be as concise as possible.',
    prompt: 'What is the weather in San Francisco?'
  })

  console.log(result.toolResults[0])
}

await main()
