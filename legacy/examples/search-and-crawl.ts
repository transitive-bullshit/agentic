import { OpenAIClient } from '@agentic/openai-fetch'
import 'dotenv/config'
import { z } from 'zod'

import { Agentic, SearchAndCrawlTool, WeatherTool } from '@/index'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const agentic = new Agentic({ openai })

  const topic = process.argv[2] || 'OpenAI'

  const res = await agentic
    .gpt4({
      messages: [
        {
          role: 'system',
          content: `You are a MckInsey analyst who is an expert at writing executive summaries. Always respond using markdown unless instructed to respond using JSON.`
        },
        {
          role: 'user',
          content: `Summarize the latest news on: {{topic}}`
        }
      ],
      model: 'gpt-4-32k'
    })
    .tools([new SearchAndCrawlTool(), new WeatherTool()])
    .input(
      z.object({
        topic: z.string()
      })
    )
    .call({ topic })

  console.log('\n\n\n')
  console.log(res)
}

main()
