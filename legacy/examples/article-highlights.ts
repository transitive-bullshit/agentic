import 'dotenv/config'
import { readFileSync } from 'fs'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic } from '@/index'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const agentic = new Agentic({ openai })

  const fileName = process.argv[2]
  const article = readFileSync(fileName, 'utf-8')

  const res = await agentic
    .gpt4({
      messages: [
        {
          role: 'system',
          content: `You are a social media manager who is an expert at writing social media posts. You are generating draft posts advertising an article. Return a list of the best quotes from the article as they relate to its topic. Return not more than three sentences per quote.`
        },
        {
          role: 'user',
          content: `Process the following article: {{article}}.`
        }
      ],
      model: 'gpt-4-32k'
    })
    .input(
      z.object({
        article: z.string()
      })
    )
    .output(
      z.array(
        z.object({
          quote: z.string()
        })
      )
    )
    .call({ article })

  console.log(`\n\n\n${JSON.stringify(res, null, 2)}\n\n\n`)
}

main()
