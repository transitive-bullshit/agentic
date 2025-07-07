import 'dotenv/config'

import { createMastraTools } from '@agentic/mastra'
import { AgenticToolClient } from '@agentic/platform-tool-client'
import { openai } from '@ai-sdk/openai'
import { Agent } from '@mastra/core/agent'

async function main() {
  const searchTool = await AgenticToolClient.fromIdentifier('@agentic/search')

  const weatherAgent = new Agent({
    name: 'Weather Agent',
    model: openai('gpt-4o-mini'),
    tools: createMastraTools(searchTool),
    instructions: 'You are a helpful assistant. Be as concise as possible.'
  })

  const res = await weatherAgent.generate(
    'What is the weather in San Francisco?'
  )
  console.log(res.text)
}

await main()
