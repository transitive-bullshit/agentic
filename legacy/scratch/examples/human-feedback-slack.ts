import 'dotenv/config'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic, HumanFeedbackMechanismSlack } from '@/index'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const ai = new Agentic({ openai })

  const out = await ai
    .gpt3(`Tell me {{num}} jokes about {{topic}}`)
    .input(
      z.object({
        topic: z.string(),
        num: z.number().int().default(5).optional()
      })
    )
    .output(z.array(z.string()))
    .modelParams({ temperature: 0.9 })
    .withHumanFeedback({
      type: 'multiselect',
      annotations: false,
      abort: false,
      editing: true,
      mechanism: HumanFeedbackMechanismSlack
    })
    .callWithMetadata({
      topic: 'politicians',
      num: 5
    })

  const feedback = out.metadata.feedback
  console.log(JSON.stringify(feedback, null, 2))
}

main()
