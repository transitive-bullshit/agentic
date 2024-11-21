import 'dotenv/config'

import { extractObject, Msg } from '@agentic/core'
import { ChatModel } from '@dexaai/dexter'
import { z } from 'zod'

async function main() {
  const chatModel = new ChatModel({
    params: { model: 'gpt-4o-mini', temperature: 0 },
    debug: true
  })

  const result = await extractObject({
    name: 'extract-user',
    chatFn: chatModel.run.bind(chatModel),
    params: {
      messages: [
        Msg.system('Extract a JSON user object from the given text.'),
        Msg.user(
          'Bob Vance is 42 years old and lives in Brooklyn, NY. He is a software engineer.'
        )
      ]
    },
    schema: z.object({
      name: z.string(),
      age: z.number(),
      location: z.string().optional()
    }),
    strict: true
  })

  console.log(result)
}

await main()
