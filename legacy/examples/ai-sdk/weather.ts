#!/usr/bin/env node
import 'dotenv/config'

import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

import { WeatherClient } from '../../src/index.js'
import { createAISDKTools } from '../../src/sdks/ai-sdk.js'

async function main() {
  const weather = new WeatherClient()

  const result = await generateText({
    model: openai('gpt-4o'),
    tools: createAISDKTools(weather),
    toolChoice: 'required',
    temperature: 0,
    system: 'You are a weather assistant. Be as concise as possible.',
    prompt: 'What is the weather in San Francisco?'
  })

  console.log(result.toolResults[0])
}

await main()
