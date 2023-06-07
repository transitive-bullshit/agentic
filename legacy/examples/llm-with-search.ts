import 'dotenv/config'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic, MetaphorSearchTool } from '@/index'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const $ = new Agentic({ openai })
  const metaphorSearch = new MetaphorSearchTool({ agentic: $ })

  const { results: searchResults } = await metaphorSearch.call({
    query: 'news from today, 2023',
    numResults: 5
  })

  console.log('searchResults', searchResults)

  const res = await $.gpt4(
    `Give me a summary of today's news. Here is what I got back from a search engine: \n{{#searchResults}}{{title}}\n{{/searchResults}}`
  )
    .input(
      z.object({
        searchResults: z.any() // TODO
      })
    )
    .output(
      z.object({
        summary: z.string(),
        linkToLearnMore: z.string(),
        metadata: z.object({
          title: z.string(),
          keyTopics: z.string().array(),
          datePublished: z.string()
        }),
        isWorthFollowingUp: z.boolean()
      })
    )
    .call({
      searchResults
    })
}

main()
