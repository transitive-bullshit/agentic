import 'dotenv/config'

import { createAISDKTools } from '@agentic/ai-sdk'
import { TavilyClient } from '@agentic/stdlib'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

async function main() {
  const tavily = new TavilyClient()
  const openai = createOpenAI({ compatibility: 'compatible' })

  const result = await generateText({
    model: openai('gpt-4o-mini', {
      // TODO: https://github.com/transitive-bullshit/agentic/issues/702
      // structuredOutputs: true
    }),
    tools: createAISDKTools(tavily),
    toolChoice: 'required',
    temperature: 0,
    system: 'You are a helpful assistant. Be as concise as possible.',
    prompt: 'What is the latest news in the US right now?'
  })

  console.log(JSON.stringify(result.toolResults[0], null, 2))
}

await main()
