import 'dotenv/config'

import { createAISDKTools } from '@agentic/ai-sdk'
import { AgenticToolClient } from '@agentic/platform-tool-client'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

async function main() {
  const searchTool = await AgenticToolClient.fromIdentifier('@agentic/search')

  const result = await generateText({
    model: openai('gpt-4o-mini'),
    tools: createAISDKTools(searchTool),
    toolChoice: 'required',
    temperature: 0,
    system: 'You are a helpful assistant. Be as concise as possible.',
    prompt: 'What is the weather in San Francisco?'
  })

  console.log(JSON.stringify(result.toolResults[0], null, 2))
}

await main()
