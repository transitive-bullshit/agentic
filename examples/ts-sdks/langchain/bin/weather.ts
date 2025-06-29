import 'dotenv/config'

import { createLangChainTools } from '@agentic/langchain'
import { AgenticToolClient } from '@agentic/platform-tool-client'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents'

async function main() {
  const searchTool = await AgenticToolClient.fromIdentifier('@agentic/search')

  const tools = createLangChainTools(searchTool)
  const agent = createToolCallingAgent({
    llm: new ChatOpenAI({ model: 'gpt-4o-mini', temperature: 0 }),
    tools,
    prompt: ChatPromptTemplate.fromMessages([
      ['system', 'You are a helpful assistant. Be as concise as possible.'],
      ['placeholder', '{chat_history}'],
      ['human', '{input}'],
      ['placeholder', '{agent_scratchpad}']
    ])
  })

  const agentExecutor = new AgentExecutor({
    agent,
    tools
    // verbose: true
  })

  const result = await agentExecutor.invoke({
    input: 'What is the weather in San Francisco?'
  })

  console.log(result.output)
}

await main()
