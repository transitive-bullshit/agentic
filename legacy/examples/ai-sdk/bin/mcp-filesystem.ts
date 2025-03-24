import 'dotenv/config'

import { createAISDKTools } from '@agentic/ai-sdk'
import { createMcpTools } from '@agentic/mcp'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { gracefulExit } from 'exit-hook'

async function main() {
  // Create an MCP tools provider, which will start a local MCP server process
  // and use the stdio transport to communicate with it.
  const mcpTools = await createMcpTools({
    name: 'agentic-mcp-filesystem',
    serverProcess: {
      command: 'npx',
      args: [
        '-y',
        '@modelcontextprotocol/server-filesystem',
        // Allow the MCP server to access the current working directory.
        process.cwd()
        // Feel free to add additional directories the tool should have access to.
      ]
    }
  })

  const result = await generateText({
    model: openai('gpt-4o-mini'),
    tools: createAISDKTools(mcpTools),
    toolChoice: 'required',
    temperature: 0,
    system: 'You are a helpful assistant. Be as concise as possible.',
    prompt: 'What files are in the current directory?'
  })

  console.log(result.toolResults[0]?.result || JSON.stringify(result, null, 2))
}

try {
  await main()
  gracefulExit(0)
} catch (err) {
  console.error(err)
  gracefulExit(1)
}
