#!/usr/bin/env node
import 'dotenv/config'

import { generate } from '@genkit-ai/ai'
import { configureGenkit } from '@genkit-ai/core'
import { gpt4o, openAI } from 'genkitx-openai'

import { WeatherClient } from '../../src/index.js'
import { tools } from '../../src/sdks/genkit.js'

async function main() {
  const weather = new WeatherClient()

  configureGenkit({
    plugins: [openAI()]
  })

  const result = await generate({
    model: gpt4o,
    tools: tools(weather),
    history: [
      {
        role: 'system',
        content: [
          {
            text: 'You are a weather assistant. Be as concise as possible.'
          }
        ]
      }
    ],
    prompt: [{ text: 'What is the weather in San Francisco?' }]
  })

  console.log(result)
}

await main()
