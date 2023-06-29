import 'dotenv/config'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic } from '@/agentic'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const ai = new Agentic({ openai })

  const out = await ai
    .gpt3(`Give me {{numFacts}} random facts about {{topic}}`)
    .input(
      z.object({
        topic: z.string(),
        numFacts: z.number().int().default(5)
      })
    )
    .output(z.array(z.string()))
    .modelParams({ temperature: 0.9 })
    .withHumanFeedback({
      type: 'confirm',
      editing: true
    })
    .call({ topic: 'cats' })

  console.log(out)
}

main()
