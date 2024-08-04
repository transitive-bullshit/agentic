#!/usr/bin/env node
import 'dotenv/config'

import { createDexterFunctions } from '@agentic/dexter'
import { DiffbotClient } from '@agentic/diffbot'
import { SearchAndCrawl } from '@agentic/search-and-crawl'
import { SerpAPIClient } from '@agentic/serpapi'
import { ChatModel, createAIRunner } from '@dexaai/dexter'

async function main() {
  const serpapi = new SerpAPIClient()
  const diffbot = new DiffbotClient()

  const searchAndCrawl = new SearchAndCrawl({ serpapi, diffbot })

  const runner = createAIRunner({
    chatModel: new ChatModel({
      params: { model: 'gpt-4o', temperature: 0 }
      // debug: true
    }),
    functions: createDexterFunctions(searchAndCrawl),
    systemMessage:
      'You are a McKinsey analyst who is an expert at writing executive summaries. Always cite your sources and respond using Markdown.'
  })

  const topic = 'the 2024 olympics'
  const result = await runner(`Summarize the latest news on ${topic}`)
  console.log(result)
}

await main()
