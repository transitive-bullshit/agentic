import { OpenAIClient } from '@agentic/openai-fetch'
import 'dotenv/config'
import { z } from 'zod'

import { Agentic, DiffbotTool, SerpAPITool } from '@/index'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const agentic = new Agentic({ openai })

  const res = await agentic
    .gpt4(`Summarize the latest news on {{topic}} using markdown.`)
    .tools([new SerpAPITool()])
    .input(
      z.object({
        topic: z.string(),
        numResults: z.number().default(3)
      })
    )
    .output(
      z.object({
        summary: z.string()
      })
    )
    .call({
      topic: 'OpenAI'
    })

  console.log(res)
}

main()
