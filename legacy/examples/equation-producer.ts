import dotenv from 'dotenv-safe'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic } from '../src'

dotenv.config()

export async function equationProducer() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const $ = new Agentic({ openai })

  const examples = [
    { input: 'What is 37593 * 67?', output: '37593 * 67' },
    {
      input:
        "Janet's ducks lay 16 eggs per day. She eats three for breakfast every morning and bakes muffins for her friends every day with four. She sells the remainder at the farmers' market daily for $2 per fresh duck egg. How much in dollars does she make every day at the farmers' market?",
      output: '(16-3-4)*2'
    },
    {
      input:
        'A robe takes 2 bolts of blue fiber and half that much white fiber. How many bolts in total does it take?',
      output: '2 + 2/2'
    }
  ]

  const question =
    'Carla is downloading a 200 GB file. She can download 2 GB/minute, but 40% of the way through the download, the download fails. Then Carla has to restart the download from the beginning. How long did it take her to download the file in minutes?'

  const example = await $.gpt4(
    `You are an expert math teacher. Think step by step, and give me the equation for the following math problem: \n\n{{question}}`
  )
    .input(z.object({ question: z.string() }))
    .output({
      question: z.string(),
      equation: z.string(),
      predictedAnswer: z.number()
    })
    .examples(examples)
    // .assert(
    //   (output) =>
    //     output.equation === '((200 x 0.6) / 2) + (200 / 2)' &&
    //     output.predictedAnswer === 100
    // )
    .call({
      question
    })

  console.log('example', example)
}

equationProducer()
