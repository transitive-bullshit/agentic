import { OpenAIClient } from '@agentic/openai-fetch'
import 'dotenv/config'
import { z } from 'zod'

import { Agentic, HumanFeedbackSingle } from '@/index'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const ai = new Agentic({ openai })

  const topicFacts = ai
    .gpt3(`Give me {{numFacts}} random facts about {{topic}}`)
    .input(
      z.object({
        topic: z.string(),
        numFacts: z.number().int().default(5).optional()
      })
    )
    .output(z.object({ facts: z.array(z.string()) }))
    .modelParams({ temperature: 0.9 })

  const feedback = new HumanFeedbackSingle(topicFacts.outputSchema)

  let out = await topicFacts.call({ topic: 'cats' })
  let hf = await feedback.call(out)
  while (!hf.accepted) {
    out = await topicFacts.call({ topic: 'cats' })
    hf = await feedback.call(out)
  }
  console.log(hf.result)
}

main()
