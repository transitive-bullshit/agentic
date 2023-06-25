import 'dotenv/config'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic, SearchAndCrawlTool } from '@/index'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const agentic = new Agentic({ openai })

  const person = process.argv[2]
  if (!person) {
    console.log('Please provide a person')
    return
  }

  const res = await agentic
    .gpt4({
      messages: [
        {
          role: 'system',
          content: `You are research assistant who is an expert at doing background research on people. Specifically, you will find people who have written about or worked with {{person}}. Besides their name, generate a short explanation of their relationship.`
        },
        {
          role: 'user',
          content: `Find people who have written about or worked with {{person}}.`
        }
      ],
      model: 'gpt-4-32k'
    })
    .tools([new SearchAndCrawlTool()])
    .input(
      z.object({
        person: z.string()
      })
    )
    .output(
      z.array(
        z.object({
          name: z.string(),
          relationship: z.string()
        })
      )
    )
    .call({ person })

  console.log(`\n\n\n${JSON.stringify(res, null, 2)}\n\n\n`)
}

main()
