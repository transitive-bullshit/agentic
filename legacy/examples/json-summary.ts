import dotenv from 'dotenv-safe'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic } from '../src'

dotenv.config()

export async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const $ = new Agentic({ openai })

  const article = await $.gpt3(
    'Generate a fake, short Wikipedia article.'
  ).call()

  const example = await $.gpt3(
    `You are a wikipedia article summarizer. However, 
    you return a bunch of important information about the article in JSON format.
    You're really good at coming up with semantic labels for the information you find.
    
    Article: {{article}}`
  )
    .input(z.object({ article: z.string() }))
    .output(
      z.object({
        title: z.string(),
        summary: z.string()
      })
    )
    // .assert((output) => JSON.parse(output.summary))
    .call({
      article
    })
}

main()
