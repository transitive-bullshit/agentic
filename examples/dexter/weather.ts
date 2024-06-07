#!/usr/bin/env node
import 'dotenv/config'

import { WeatherClient } from '@agentic/stdlib'
import { createDexterFunctions } from '@agentic/stdlib/dexter'
import { ChatModel, createAIRunner } from '@dexaai/dexter'

async function main() {
  const weather = new WeatherClient()

  const runner = createAIRunner({
    chatModel: new ChatModel({
      params: { model: 'gpt-4o', temperature: 0 }
      // debug: true
    }),
    functions: createDexterFunctions(weather),
    systemMessage: 'You are a helpful assistant. Be as concise as possible.'
  })

  const result = await runner('What is the weather in San Francisco?')
  console.log(result)
}

await main()
