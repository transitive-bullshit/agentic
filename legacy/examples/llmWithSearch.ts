import dotenv from 'dotenv-safe'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import {
  Agentic,
  MetaphorSearchTool,
  MetaphorSearchToolOutputSchema
} from '../src'

dotenv.config()

async function main() {
  const metaphorSearch = new MetaphorSearchTool()

  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })

  const $ = new Agentic({ openai })

  const searchResults = await metaphorSearch
    .call({
      query: 'news from today',
      numResults: 5
    })
    .map((r) => r.result.title)

  console.log('searchResults', searchResults)

  const foodAgent = await $.gpt4(
    `Give me a summary of today's news. Here is what I got back from a search engine: {{searchResults.results}}`
  )
    .input(
      z.object({
        searchResults: MetaphorSearchToolOutputSchema,
        afaf: z.string()
      })
    )
    .output(
      z.object({
        summary: z.string(),
        linkToLearnMore: z.string(),
        metaData: z.object({
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
