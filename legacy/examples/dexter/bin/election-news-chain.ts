import 'dotenv/config'

import { createAIChain, Msg } from '@agentic/core'
import { PerigonClient } from '@agentic/perigon'
import { SerperClient } from '@agentic/serper'
import { ChatModel } from '@dexaai/dexter'

async function main() {
  const perigon = new PerigonClient()
  const serper = new SerperClient()

  const chatModel = new ChatModel({
    params: { model: 'gpt-4o-mini', temperature: 0 },
    debug: true
  })

  const chain = createAIChain({
    name: 'search_news',
    chatFn: chatModel.run.bind(chatModel),
    tools: [perigon.functions.pick('search_news_stories'), serper],
    params: {
      messages: [
        Msg.system(
          'You are a helpful assistant. Be as concise as possible. Respond in markdown. Always cite your sources.'
        )
      ]
    }
  })

  const result = await chain(
    'Summarize the latest news stories about the upcoming US election.'
  )
  console.log(result)
}

await main()
