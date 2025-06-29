import 'dotenv/config'

import { createLlamaIndexTools } from '@agentic/llamaindex'
import { AgenticToolClient } from '@agentic/platform-tool-client'
import { openai } from '@llamaindex/openai'
import { agent } from '@llamaindex/workflow'

async function main() {
  const searchTool = await AgenticToolClient.fromIdentifier('@agentic/search')

  const tools = createLlamaIndexTools(searchTool)
  const weatherAgent = agent({
    llm: openai({ model: 'gpt-4o-mini', temperature: 0 }),
    systemPrompt: 'You are a helpful assistant. Be as concise as possible.',
    tools
  })

  const response = await weatherAgent.run(
    'What is the weather in San Francisco?'
  )

  console.log(response.data.result)
}

await main()
