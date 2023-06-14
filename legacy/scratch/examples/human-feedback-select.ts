import { OpenAIClient } from '@agentic/openai-fetch'
import 'dotenv/config'
import { z } from 'zod'

import { Agentic, HumanFeedbackSelect } from '@/index'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const ai = new Agentic({ openai })

  const jokes = ai
    .gpt3(`Tell me {{num}} jokes about {{topic}}`)
    .input(
      z.object({
        topic: z.string(),
        num: z.number().int().default(5).optional()
      })
    )
    .output(z.array(z.string()))
    .modelParams({ temperature: 0.9 })

  const feedback = new HumanFeedbackSelect(z.string())
  let out = await jokes.call({ topic: 'statisticians' })
  let hf = await feedback.call(out)
  while (!hf.accepted) {
    out = await jokes.call({ topic: 'statisticians' })
    hf = await feedback.call(out)
  }
  console.log(hf.results)
}

main()
