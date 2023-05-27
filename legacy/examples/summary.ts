import dotenv from 'dotenv-safe'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic } from '../src'

dotenv.config()

export async function summaryAgent() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const $ = new Agentic({ openai })

  return $.gpt4(
    `You are an expert at summarizing web pages. Summarize this article for me: {{article}}`
  ).input(z.object({ article: z.string() }))
}
