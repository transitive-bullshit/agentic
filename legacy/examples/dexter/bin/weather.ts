import 'dotenv/config'

import { createDexterFunctions } from '@agentic/dexter'
import { WeatherClient } from '@agentic/weather'
import { ChatModel, createAIRunner } from '@dexaai/dexter'

async function main() {
  const weather = new WeatherClient()

  const runner = createAIRunner({
    chatModel: new ChatModel({
      params: { model: 'gpt-4o-mini', temperature: 0 }
      // debug: true
    }),
    functions: createDexterFunctions(weather),
    systemMessage: 'You are a helpful assistant. Be as concise as possible.'
  })

  const result = await runner('What is the weather in San Francisco?')
  console.log(result)
}

await main()
