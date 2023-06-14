import { OpenAIClient } from '@agentic/openai-fetch'
import 'dotenv/config'
import { z } from 'zod'

import { Agentic, CalculatorTool } from '@/index'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const agentic = new Agentic({ openai })

  const example = await agentic
    .gpt3('What is 5 * 50?')
    .tools([new CalculatorTool({ agentic })])
    .output(z.object({ answer: z.number() }))
    .call()
  console.log(example)
}

main()
