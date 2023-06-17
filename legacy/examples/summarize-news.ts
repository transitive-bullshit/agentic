import { OpenAIClient } from '@agentic/openai-fetch'
import 'dotenv/config'
import { z } from 'zod'

import { Agentic, SerpAPITool } from '@/index'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const agentic = new Agentic({ openai })

  const res = await agentic
    .gpt4(`Summarize the latest news on {{topic}} using markdown.`)
    .tools([new SerpAPITool()])
    .input(
      z.object({
        topic: z.string()
      })
    )
    .output(
      z.object({
        summary: z.string()
      })
    )
    .call({
      topic: 'HF0 accelerator'
    })

  console.log('\n\n\n' + res)
}

main()
