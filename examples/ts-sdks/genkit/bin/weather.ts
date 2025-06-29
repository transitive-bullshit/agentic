import 'dotenv/config'

import { createGenkitTools } from '@agentic/genkit'
import { AgenticToolClient } from '@agentic/platform-tool-client'
import { genkit } from 'genkit'
import { gpt4oMini, openAI } from 'genkitx-openai'

async function main() {
  const searchTool = await AgenticToolClient.fromIdentifier('@agentic/search')

  const ai = genkit({
    plugins: [openAI()]
  })

  const result = await ai.generate({
    model: gpt4oMini,
    tools: createGenkitTools(ai, searchTool),
    system: 'You are a helpful assistant. Be as concise as possible.',
    prompt: 'What is the weather in San Francisco?'
  })

  console.log(result)
}

await main()
