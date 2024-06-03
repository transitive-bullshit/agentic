#!/usr/bin/env node
import 'dotenv/config'

import { ChatModel, createAIRunner } from '@dexaai/dexter'

import { WeatherClient } from '../../src/index.js'
import { createDexterFunctions } from '../../src/sdks/dexter.js'

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
