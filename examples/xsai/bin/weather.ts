/* eslint-disable no-process-env */
import 'dotenv/config'

import { WeatherClient } from '@agentic/weather'
import { createXSAISDKTools } from '@agentic/xsai'
import { generateText } from 'xsai'

async function main() {
  const weather = new WeatherClient()

  const result = await generateText({
    apiKey: process.env.OPENAI_API_KEY!,
    baseURL: 'https://api.openai.com/v1/',
    model: 'gpt-4o-mini',
    tools: await createXSAISDKTools(weather),
    toolChoice: 'required',
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant. Be as concise as possible.'
      },
      { role: 'user', content: 'What is the weather in San Francisco?' }
    ]
  })

  console.log(JSON.stringify(result, null, 2))
}

await main()
