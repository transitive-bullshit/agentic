import dotenv from 'dotenv-safe'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic } from '../src'

dotenv.config()

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const $ = new Agentic({ openai })

  const ex1 = await $.gpt4(`generate fake data`)
    // .output(z.object({ foo: z.string(), bar: z.number() }))
    .call()
  console.log(ex1)
}

main()
