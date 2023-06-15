import { OpenAIClient } from '@agentic/openai-fetch'
import 'dotenv/config'
import { z } from 'zod'

import { Agentic, CalculatorTool, WeatherTool } from '@/index'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const agentic = new Agentic({ openai })

  const example = await agentic
    .gpt3('What is the temperature in san francisco today?')
    .tools([new CalculatorTool(), new WeatherTool()])
    .output(
      z.object({
        answer: z.number(),
        units: z.union([z.literal('fahrenheit'), z.literal('celcius')])
      })
    )
    .call()
  console.log(example)
}

main()
