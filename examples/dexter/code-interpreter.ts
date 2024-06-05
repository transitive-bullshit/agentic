#!/usr/bin/env node
import 'dotenv/config'

import { ChatModel, createAIRunner } from '@dexaai/dexter'

import { createDexterFunctions } from '../../src/sdks/dexter.js'
import { e2b } from '../../src/tools/e2b.js'

async function main() {
  const runner = createAIRunner({
    chatModel: new ChatModel({
      params: { model: 'gpt-4o', temperature: 0 },
      debug: true
    }),
    functions: createDexterFunctions(e2b)
  })

  const result = await runner(
    'Visualize a distribution of height of men based on the latest data you know. Also print the median value.'
  )
  console.log(result)
}

await main()
