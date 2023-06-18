import 'dotenv/config'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic } from '@/agentic'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const $ = new Agentic({ openai })

  const ex0 = await $.gpt4(`give me a single boolean value: `)
    .output(z.boolean())
    // .retry({ attempts: 3 })
    .call()

  // LLM
  // give me a single boolean value
  // given an output as a boolean.
  // true/false

  const ex1 = await $.gpt4('give me a list of character names from star wars')
    .output(z.array(z.string().nonempty()))
    // .stream()
    .call()

  const ex2 = await $.gpt4(`Summarize the following text: {{text}}`)
    .output(z.string().nonempty())
    .input(z.object({ text: z.string().nonempty() }))
    .call({
      text: 'The quick brown fox jumps over the lazy dog.'
    })

  // const ext22 = await $.gpt4({ temperature: 0 }).call({
  //   messages: [
  //     // TEST
  //   ]
  // })

  const ex3 = await $.gpt4({
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: 'You extract movie titles from text.'
      },
      {
        role: 'user',
        content: `Extract the movie title from the following text or return 'none' if no movie title is found.`
      }
    ]
  })
    .examples([
      {
        input: `Deadpool 2 | Official HD Deadpool's "Wet on Wet" Teaser | 2018`,
        output: `Deadpool 2`
      },
      {
        input: `Jordan Peele Just Became the First Black Writer-Director With a $100M Movie Debut`,
        output: 'none'
      },
      {
        input: 'Joker Officially Rated “R”',
        output: 'Joker'
      },
      {
        input: `Ryan Reynolds’ 'Free Guy' Receives July 3, 2020 Release Date - About a bank teller stuck in his routine that discovers he’s an NPC character in a brutal open world game.`,
        output: 'Free Guy'
      },
      {
        input: 'James Cameron congratulates Kevin Feige and Marvel!',
        output: 'none'
      },
      {
        input:
          'The Cast of Guardians of the Galaxy release statement on James Gunn',
        output: 'Guardians of the Galaxy'
      }
    ])
    .output(z.string().nonempty())
    .call()
}

main()
