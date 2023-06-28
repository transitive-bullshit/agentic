import 'dotenv/config'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic, NovuNotificationTool, SerpAPITool } from '@/index'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const agentic = new Agentic({ openai })

  const question = 'How do I build a product that people will love?'

  const result = await agentic
    .gpt4(
      `Generate a list of {n} prominent experts that can answer the following question: {{question}}.`
    )
    .tools([new SerpAPITool()])
    .output(
      z.array(
        z.object({
          name: z.string(),
          bio: z.string()
        })
      )
    )
    .input(
      z.object({
        question: z.string(),
        n: z.number().int().default(5)
      })
    )
    .withHumanFeedback({
      type: 'multiselect'
    })
    .call({
      question
    })

  const answer = await agentic
    .gpt4(
      `Generate an answer to the following question: "{{question}}" from each of the following experts: {{#each experts}}
      - {{this.name}}: {{this.bio}}
      {{/each}}`
    )
    .output(
      z.array(
        z.object({
          expert: z.string(),
          answer: z.string()
        })
      )
    )
    .input(
      z.object({
        question: z.string(),
        experts: z.array(z.object({ name: z.string(), bio: z.string() }))
      })
    )
    .call({
      question,
      experts: result
    })

  const message = answer.reduce((acc, { expert, answer }) => {
    return `${acc}

      ${expert}: ${answer}`
  }, '')

  const notifier = new NovuNotificationTool()
  await notifier.call({
    name: 'send-email',
    payload: {
      subject: 'Experts have answered your question: ' + question,
      message
    },
    to: [{ subscriberId: '123' }]
  })
}

main()
