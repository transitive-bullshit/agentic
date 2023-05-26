import dotenv from 'dotenv-safe'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic } from '../src'

dotenv.config()

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const $ = new Agentic({ openai })

  // const ex0 = await $.gpt4(`give me a single boolean value`)
  //   .output(z.boolean())
  //   // .retry({ attempts: 3 })
  //   .call()
  // console.log(ex0)

  const ex1 = await $.gpt4(`give me fake data`)
    .output(z.object({ foo: z.string(), bar: z.number() }))
    // .output(z.string())
    // .retry({ attempts: 3 })
    .call()
  console.log(ex1)

  // const getBoolean = $.gpt4(`are you {{mood}}?`)
  //   .input(z.object({ mood: z.string() }))
  //   .output(z.boolean())

  // const results = await Promise.all([
  //   getBoolean.call({ mood: 'happy' }),
  //   getBoolean.call({ mood: 'sad' })
  // ])
  // console.log(results)
}

main()
