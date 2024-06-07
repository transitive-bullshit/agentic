import 'dotenv/config'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic, MetaphorSearchTool } from '@/index'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const $ = new Agentic({ openai })

  const metaphorSearch = new MetaphorSearchTool({ agentic: $ })
  const results = await metaphorSearch.call({
    query: 'probability of AI doom:',
    numResults: 5
  })
  console.log(results)
}

main()
