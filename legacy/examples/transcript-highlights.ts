import 'dotenv/config'
import { readFileSync } from 'fs'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic } from '@/index'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const agentic = new Agentic({ openai })

  const fileName = process.argv[2]
  const transcript = readFileSync(fileName, 'utf-8')

  const res = await agentic
    .gpt4({
      messages: [
        {
          role: 'system',
          content: `You are a social media manager who is an expert at writing social media posts. You are generating draft posts advertising for a new podcast episode. Return a list of the best quotes by the interviewee from the transcript as they relate to the topic of the podcast. A quote can span multiple paragraphs.`
        },
        {
          role: 'user',
          content: `Process the following transcript: {{transcript}}.`
        }
      ],
      model: 'gpt-4-32k'
    })
    .input(
      z.object({
        transcript: z.string()
      })
    )
    .output(
      z.array(
        z.object({
          quote: z.string(),
          timestampStart: z.string(),
          timestampEnd: z.string()
        })
      )
    )
    .call({ transcript })

  console.log(`\n\n\n${JSON.stringify(res, null, 2)}\n\n\n`)
}

main()
