#!/usr/bin/env node
import 'dotenv/config'

import {
  ChatModel,
  createAIFunction,
  createAIRunner,
  Msg
} from '@dexaai/dexter'
import { z } from 'zod'

import { WeatherClient } from '../../src/index.js'
import { createDexterFunctions } from '../../src/sdks/dexter.js'

/** Get the capital city for a given state. */
const getCapitalCity = createAIFunction(
  {
    name: 'get_capital_city',
    description: 'Use this to get the the capital city for a given state',
    argsSchema: z.object({
      state: z
        .string()
        .length(2)
        .describe(
          'The state to get the capital city for, using the two letter abbreviation e.g. CA'
        )
    })
  },
  async ({ state }) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    let capitalCity = ''
    switch (state) {
      case 'CA':
        capitalCity = 'Sacramento'
        break
      case 'NY':
        capitalCity = 'Albany'
        break
      default:
        capitalCity = 'Unknown'
    }
    return { capitalCity }
  }
)

const weather = new WeatherClient()

/** A runner that uses the weather and capital city functions. */
const weatherCapitalRunner = createAIRunner({
  chatModel: new ChatModel({ params: { model: 'gpt-4-1106-preview' } }),
  functions: [...createDexterFunctions(weather), getCapitalCity],
  systemMessage: `You use functions to answer questions about the weather and capital cities.`
})

async function main() {
  // Run with a string input
  const rString = await weatherCapitalRunner(
    `Whats the capital of California and NY and the weather for both?`
  )
  console.log('rString', rString)

  // Run with a message input
  const rMessage = await weatherCapitalRunner({
    messages: [
      Msg.user(
        `Whats the capital of California and NY and the weather for both?`
      )
    ]
  })
  console.log('rMessage', rMessage)
}

await main()
