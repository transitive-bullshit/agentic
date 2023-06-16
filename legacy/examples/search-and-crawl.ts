import { OpenAIClient } from '@agentic/openai-fetch'
import 'dotenv/config'
import { z } from 'zod'

import { Agentic, SearchAndCrawlTool } from '@/index'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const agentic = new Agentic({ openai })

  const res = await agentic
    .gpt4(`Summarize the latest news on {{topic}} using markdown.`)
    .modelParams({
      model: 'gpt-4-32k'
    })
    .tools([new SearchAndCrawlTool()])
    .input(
      z.object({
        topic: z.string()
      })
    )
    .call({
      topic: 'OpenAI'
    })

  console.log(res)
}

main()
