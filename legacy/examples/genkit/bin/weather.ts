import 'dotenv/config'

import { createGenkitTools } from '@agentic/genkit'
import { WeatherClient } from '@agentic/stdlib'
import { genkit } from 'genkit'
import { gpt4oMini, openAI } from 'genkitx-openai'

async function main() {
  const weather = new WeatherClient()

  const ai = genkit({
    plugins: [openAI()]
  })

  const result = await ai.generate({
    model: gpt4oMini,
    tools: createGenkitTools(ai, weather),
    system: 'You are a helpful assistant. Be as concise as possible.',
    prompt: 'What is the weather in San Francisco?'
  })

  console.log(result)
}

await main()
