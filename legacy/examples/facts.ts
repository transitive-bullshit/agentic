import dotenv from 'dotenv-safe'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic } from '../src'

dotenv.config()

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const ai = new Agentic({ openai })

  const out = await ai
    .gpt3(`Give me {{numFacts}} random facts about {{topic}}`)
    .input(
      z.object({ topic: z.string(), numFacts: z.number().int().default(5) })
    )
    .output(z.object({ facts: z.array(z.string()) }))
    .modelParams({ temperature: 0.9 })
    .call({ topic: 'cats' })

  console.log(out)

  /*
     Example output:
     [
        'The scientific name for the domestic cat is Felis catus.',
        'Cats spend 70% of their lives sleeping.',
        'A group of cats is called a clowder.',
        'Cats have over 100 different vocal sounds.',
        'A cat’s nose pad is ridged with a unique pattern, just like a human fingerprint.',
        'Cats can jump up to six times their length.',
        'Cats can make over 20 different sounds.',
        'Cats have five toes on each front paw, but only four toes on each back paw.',
        'A cat’s whiskers are highly sensitive and can detect changes in air currents.',
        'Cats have a flexible spine and can rotate their ears 180 degrees.',
        'Cats can run up to 30 miles per hour.',
        'Cats are believed to be the only mammals who don’t taste sweetness.',
        'Cats have excellent night vision and can see at one-sixth the light level required for human vision.',
        'Cats can’t see directly under their nose.',
        'Cats can make more than 100 different sounds.',
        'A cat can travel at a top speed of approximately 31 mph (49 km) over a short distance.',
        'Cats are capable of walking very precisely. When they take a step, they place their back paw almost exactly in the same place as their front paw was – this is called ‘direct registering’.',
        'A cat’s hearing is much more sensitive than humans and dogs.',
        'Cats have been domesticated for around 4,000 years.',
        'Cats use their tails to maintain balance and communicate their mood.',
        'A cat’s brain is biologically more similar to a human brain than it is to a dog’s.',
        'Cats conserve energy by sleeping for an average of 13 to 14 hours a day.',
        'A cat has a total of 24 whiskers – 4 first-order, 8 second-order, and 12 third-order.',
        'Cats can pick up on changes in the weather, which can indicate to them that a storm is coming.',
        'Cats have an acute sense of hearing and can detect an ultra-sonic range of sounds up to two octaves higher than humans.',
        'Cats can learn to manipulate humans with their meows.',
        'Cats have 32 muscles in each ear.',
        'The average lifespan of an indoor cat is 13 to 17 years.',
        'Cats are one of the most popular pets in the world, and there are more than 500 million domestic cats in existence.'
     ]
  */
}

main()
