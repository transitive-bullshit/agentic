import 'dotenv/config'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import {
  Agentic,
  HumanFeedbackMechanismTwilio,
  SearchAndCrawlTool,
  WeatherTool
} from '@/index'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const agentic = new Agentic({
    openai,
    humanFeedbackDefaults: {
      mechanism: HumanFeedbackMechanismTwilio
    }
  })

  const topic = process.argv[2] || 'OpenAI'

  const res0 = await agentic
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
    .output(z.array(z.string()).describe('question'))
    .withHumanFeedback({ type: 'multiselect' })
    .callWithMetadata({ topic })

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
          content: `You are a McKinsey analyst who is an expert at writing executive summaries. Be srue to cite your sources using markdown.`
        },
        {
          role: 'user',
          content: (input) =>
            `Write a thorough executive summary on this topic: ${topic}. In order to do this, you will need to answer the following questions: \n${input.questions
              .map((q) => `- ${q}`)
              .join('\n')}`
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

  console.log(`\n\n\n${res}\n\n\n`)
}

main()
