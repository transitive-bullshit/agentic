import 'dotenv/config'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic, ReplicateStableDiffusionTool } from '@/index'

async function main() {
  const openai = new OpenAIClient({
    apiKey: process.env.OPENAI_API_KEY!,
    fetchOptions: {
      timeout: false
    }
  })
  const agentic = new Agentic({ openai })

  const topic = process.argv[2] || 'san francisco'

  const res = await agentic
    .gpt4(
      `Generate {{numImages}} images of {{topic}}. Use prompts that are artistic and creative.`
    )
    .modelParams({ temperature: 1.0 })
    .tools([new ReplicateStableDiffusionTool()])
    .input(
      z.object({
        numImages: z.number().default(5),
        topic: z.string()
      })
    )
    .call({
      topic
    })

  console.log(`\n\n\n${res}\n\n\n`)
}

main()
