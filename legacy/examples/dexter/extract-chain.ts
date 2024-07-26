#!/usr/bin/env node
import 'dotenv/config'

import { createAIChain, Msg } from '@agentic/stdlib'
import { ChatModel } from '@dexaai/dexter'
import { z } from 'zod'

async function main() {
  const chatModel = new ChatModel({
    params: { model: 'gpt-4o', temperature: 0 },
    debug: true
  })

  const chain = createAIChain({
    chatFn: chatModel.run.bind(chatModel),
    params: {
      messages: [Msg.system('Extract a JSON user object from the given text.')]
    },
    schema: z.object({
      name: z.string(),
      age: z.number(),
      location: z.string().optional()
    })
  })

  const result = await chain(
    'Bob Vance is 42 years old and lives in Brooklyn, NY. He is a software engineer.'
  )
  console.log(result)
}

await main()
