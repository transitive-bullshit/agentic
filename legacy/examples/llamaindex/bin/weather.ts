import 'dotenv/config'

import { createLlamaIndexTools } from '@agentic/llamaindex'
import { WeatherClient } from '@agentic/stdlib'
import { openai } from '@llamaindex/openai'
import { agent } from '@llamaindex/workflow'

async function main() {
  const weather = new WeatherClient()

  const tools = createLlamaIndexTools(weather)
  const weatherAgent = agent({
    name: 'Weather Agent',
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
