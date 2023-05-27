import dotenv from 'dotenv-safe'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic } from '../src'

dotenv.config()

export async function sentimentAgent() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const $ = new Agentic({ openai })

  const article = await $.gpt4(
    'I want an article that seems like it was on Wikipedia. It should be 500 characters long.'
  ).call()

  console.log('got an article', article)

  const example = await $.gpt4(
    `You are a wikipedia article summarizer. However, 
    you return a bunch of important information about the article in JSON format.
    You're really good at coming up with semantic labels for the information you find.
    
    Article: {{article}}`
  )
    .input(z.object({ article: z.string() }))
    .output(
      z.object({
        title: z.string(),
        serializedJsonSummary: z.string()
      })
    )
    // .assert((output) => JSON.parse(output.serializedJsonSummary))
    .call({
      article
    })

  console.log('example', example)
}

sentimentAgent()
