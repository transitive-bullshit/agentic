#!/usr/bin/env node
import 'dotenv/config'

import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

import { WeatherClient } from '../../src/index.js'
import { tools } from '../../src/sdks/ai-sdk.js'

async function main() {
  const weather = new WeatherClient()

  const result = await generateText({
    model: openai('gpt-4-turbo'),
    tools: tools(weather),
    toolChoice: 'required',
    prompt:
      'What is the weather in San Francisco and what attractions should I visit?'
  })

  console.log(result.toolResults[0])
}

await main()
