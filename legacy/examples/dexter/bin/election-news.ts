import 'dotenv/config'

import { createDexterFunctions } from '@agentic/dexter'
import { PerigonClient } from '@agentic/perigon'
import { SerperClient } from '@agentic/serper'
import { ChatModel, createAIRunner } from '@dexaai/dexter'

async function main() {
  const perigon = new PerigonClient()
  const serper = new SerperClient()

  const runner = createAIRunner({
    chatModel: new ChatModel({
      params: { model: 'gpt-4o-mini', temperature: 0 }
      // debug: true
    }),
    functions: createDexterFunctions(
      perigon.functions.pick('search_news_stories'),
      serper
    ),
    systemMessage:
      'You are a helpful assistant. Be as concise as possible. Respond in markdown. Always cite your sources.'
  })

  const result = await runner(
    'Summarize the latest news stories about the upcoming US election.'
  )
  console.log(result)
}

await main()
