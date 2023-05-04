import dotenv from 'dotenv-safe'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic } from './llm'

dotenv.config()
async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const $ = new Agentic(openai)

  const ex0 = await $.gpt4(`give me a single boolean value`)
    .output(z.boolean())
    // .retry({ attempts: 3 })
    .call()

  console.log(ex0)
}

main()
