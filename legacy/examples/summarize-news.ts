import { OpenAIClient } from '@agentic/openai-fetch'
import 'dotenv/config'
import { z } from 'zod'

import { Agentic, SerpAPITool } from '@/index'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const agentic = new Agentic({ openai })

  const topic = process.argv[2] || 'HF0 accelerator'

  const res = await agentic
    .gpt4(`Summarize the latest news on {{topic}} using markdown.`)
    .tools([new SerpAPITool()])
    .input(
      z.object({
        topic: z.string()
      })
    )
    .call({
      topic
    })

  console.log('\n\n\n' + res)
}

main()
