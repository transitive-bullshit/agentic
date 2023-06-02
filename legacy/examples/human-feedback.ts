import 'dotenv/config'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic, HumanFeedback } from '../src'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const ai = new Agentic({ openai })
  const feedback = new HumanFeedback()

  let retry = true
  while (retry) {
    const out = await ai
      .gpt3(`Give me {{numFacts}} random facts about {{topic}}`)
      .input(
        z.object({
          topic: z.string(),
          numFacts: z.number().int().default(5).optional()
        })
      )
      .output(z.object({ facts: z.array(z.string()) }))
      .modelParams({ temperature: 0.9 })
      .call({ topic: 'cats' })

    retry = await feedback.process(out).requestFeedback()
  }
  console.log(feedback.getResult())
}

main()
