import { OpenAIClient } from '@agentic/openai-fetch'
import 'dotenv/config'
import { z } from 'zod'

import {
  Agentic,
  HumanFeedbackMechanismTwilio,
  SearchAndCrawlTool,
  WeatherTool,
  withHumanFeedback
} from '@/index'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const agentic = new Agentic({ openai })

  const topic = process.argv[2] || 'OpenAI'

  const res0 = await withHumanFeedback(
    agentic
      .gpt4({
        messages: [
          {
            role: 'system',
            content: `You are a McKinsey analyst who is an expert at writing executive summaries.`
          },
          {
            role: 'user',
            content: `What are the 3 most important questions we would need to answer in order to have a thorough understanding of this topic: {{topic}}? Be concise but creative in your questions, and make sure to capture the true essence of the topic.`
          }
        ],
        model: 'gpt-4',
        temperature: 1.0
      })
      .input(
        z.object({
          topic: z.string()
        })
      )
      .output(z.array(z.string()).describe('question')),
    {
      type: 'selectN',
      mechanism: HumanFeedbackMechanismTwilio
    }
  ).callWithMetadata({ topic })

  console.log()
  console.log()
  console.log(`Questions: ${res0.result}`)
  console.log()
  console.log()

  const questions: string[] = (res0.metadata.feedback as any)!.selected

  const res = await agentic
    .gpt4({
      messages: [
        {
          role: 'system',
          content: `You are a McKinsey analyst who is an expert at writing executive summaries.`
        },
        {
          role: 'user',
          content: `Write a thorough executive summary on this topic: {{topic}}.
          In order to do this, you will need to answer the following questions: \n{{#questions}}- {{.}}\n{{/questions}}`
        }
      ],
      model: 'gpt-4-32k'
    })
    .tools([new SearchAndCrawlTool(), new WeatherTool()])
    .input(
      z.object({
        topic: z.string(),
        questions: z.array(z.string())
      })
    )
    .call({ topic, questions })

  console.log('\n\n\n')
  console.log(res)
}

main()
