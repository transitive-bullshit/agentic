import 'dotenv/config'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic } from '../src'

export async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const $ = new Agentic({ openai })

  const example = await $.gpt4(
    `You are an expert sentiment-labelling assistant. Label the following texts as positive or negative: \n{{#texts}}- {{.}}\n{{/texts}}`
  )
    .input(z.object({ texts: z.string().array() }))
    .output(z.array(z.object({ text: z.string(), label: z.string() })))
    // .examples([
    //   { input: 'The food was digusting', output: 'negative' },
    //   { input: 'We had a fantastic night', output: 'positive' },
    //   { input: 'Recommended', output: 'positive' },
    //   { input: 'The waiter was rude', output: 'negative' }
    // ])
    .call({
      texts: [
        'I went to this place and it was just so awful.',
        'I had a great time.',
        'I had a terrible time.',
        'Food poisoning...'
      ]
    })

  console.log('example', example)
}

main()
