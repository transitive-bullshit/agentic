import type { Deployment, Project } from '@agentic/platform-types'
import type { BundledLanguage } from 'shiki/bundle/web'
import { assert } from '@agentic/platform-core'

import { gatewayBaseUrl } from './config'

export const targetLabels = {
  mcp: 'MCP',
  typescript: 'TypeScript',
  python: 'Python',
  http: 'HTTP'
} as const
export const targets: (keyof typeof targetLabels)[] = Object.keys(
  targetLabels
) as any
export type Target = (typeof targets)[number]

export const httpTargetLabels = {
  curl: 'cURL',
  httpie: 'HTTPie'
} as const
export const httpTargets: (keyof typeof httpTargetLabels)[] = Object.keys(
  httpTargetLabels
) as any
export type HTTPTarget = (typeof httpTargets)[number]

export const mcpClientTargetLabels = {
  url: 'MCP Server URL',
  'claude-desktop': 'Claude Desktop',
  raycast: 'Raycast',
  cursor: 'Cursor',
  windsurf: 'Windsurf',
  cline: 'Cline',
  goose: 'Goose'
} as const
export const mcpClientTargets: (keyof typeof mcpClientTargetLabels)[] =
  Object.keys(mcpClientTargetLabels) as any
export type MCPClientTarget = (typeof mcpClientTargets)[number]

export const tsFrameworkTargetLabels = {
  ai: 'Vercel AI SDK',
  'openai-chat': 'OpenAI Chat',
  'openai-responses': 'OpenAI Responses',
  langchain: 'LangChain',
  llamaindex: 'LlamaIndex',
  mastra: 'Mastra',
  'firebase-genkit': 'Firebase GenKit',
  xsai: 'xsAI'
} as const
export const tsFrameworkTargets: (keyof typeof tsFrameworkTargetLabels)[] =
  Object.keys(tsFrameworkTargetLabels) as any
export type TsFrameworkTarget = (typeof tsFrameworkTargets)[number]

export const pyFrameworkTargetLabels = {
  openai: 'OpenAI',
  langchain: 'LangChain',
  llamaindex: 'LlamaIndex'
} as const
export const pyFrameworkTargets: (keyof typeof pyFrameworkTargetLabels)[] =
  Object.keys(pyFrameworkTargetLabels) as any
export type PyFrameworkTarget = (typeof pyFrameworkTargets)[number]

export type DeveloperConfig = {
  target: Target
  mcpClientTarget: MCPClientTarget
  tsFrameworkTarget: TsFrameworkTarget
  pyFrameworkTarget: PyFrameworkTarget
  httpTarget: HTTPTarget
}

export const defaultConfig: DeveloperConfig = {
  target: 'typescript',
  mcpClientTarget: 'url',
  tsFrameworkTarget: 'ai',
  pyFrameworkTarget: 'openai',
  httpTarget: 'curl'
}

export type CodeSnippet = {
  code: string
  lang: BundledLanguage
  // install?: string // TODO
}

export function getCodeForDeveloperConfig(opts: {
  config: DeveloperConfig
  project: Project
  deployment: Deployment
  identifier: string
  tool?: string
}): CodeSnippet {
  const { config } = opts

  switch (config.target) {
    case 'mcp':
      return getCodeForMCPClientConfig(opts)
    case 'typescript':
      return getCodeForTSFrameworkConfig(opts)
    case 'python':
      return getCodeForPythonFrameworkConfig(opts)
    case 'http':
      return getCodeForHTTPConfig(opts)
  }
}

export function getCodeForMCPClientConfig({
  identifier
}: {
  identifier: string
}): CodeSnippet {
  return {
    code: `${gatewayBaseUrl}/${identifier}/mcp`,
    lang: 'bash'
  }
}

export function getCodeForTSFrameworkConfig({
  config,
  identifier,
  prompt = 'What is the latest news about AI?'
}: {
  config: DeveloperConfig
  identifier: string
  prompt?: string
}): CodeSnippet {
  switch (config.tsFrameworkTarget) {
    case 'ai':
      return {
        code: `
import { createAISDKTools } from '@agentic/ai-sdk'
import { AgenticToolClient } from '@agentic/platform-tool-client'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

const searchTool = await AgenticToolClient.fromIdentifier('${identifier}')

const result = await generateText({
  model: openai('gpt-4o-mini'),
  tools: createAISDKTools(searchTool),
  toolChoice: 'required',
  prompt: '${prompt}'
})

console.log(result.toolResults[0])
      `.trim(),
        lang: 'ts'
      }

    case 'openai-chat':
      return {
        code: `
import { AgenticToolClient } from '@agentic/platform-tool-client'
import OpenAI from 'openai'

const openai = new OpenAI()
const searchTool = await AgenticToolClient.fromIdentifier('${identifier}')

// This example uses OpenAI's Chat Completions API
const res = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    {
      role: 'user',
      content: '${prompt}'
    }
  ],
  tools: searchTool.functions.toolSpecs,
  tool_choice: 'required'
})

const message = res.choices[0]!.message!
const toolCall = message.tool_calls![0]!.function!
const toolResult = await searchTool.callTool(toolCall.name, toolCall.arguments)

console.log(toolResult)
`.trim(),
        lang: 'ts'
      }

    case 'openai-responses':
      return {
        code: `
import { AgenticToolClient } from '@agentic/platform-tool-client'
import OpenAI from 'openai'

const openai = new OpenAI()
const searchTool = await AgenticToolClient.fromIdentifier('${identifier}')

// This example uses OpenAI's newer Responses API
const res = await openai.responses.create({
  model: 'gpt-4o-mini',
  tools: searchTool.functions.responsesToolSpecs,
  tool_choice: 'required',
  input: [
    {
      role: 'user',
      content: '${prompt}'
    }
  ]
})

const toolCall = res.output[0]
const toolResult = await searchTool.callTool(toolCall.name, toolCall.arguments)

console.log(toolResult)
`.trim(),
        lang: 'ts'
      }

    case 'langchain':
      return {
        code: `
import { createLangChainTools } from '@agentic/langchain'
import { AgenticToolClient } from '@agentic/platform-tool-client'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents'

const searchTool = await AgenticToolClient.fromIdentifier('${identifier}')

const agent = createToolCallingAgent({
  llm: new ChatOpenAI({ model: 'gpt-4o-mini' }),
  tools: createLangChainTools(searchTool),
  prompt: ChatPromptTemplate.fromMessages([
    ['placeholder', '{chat_history}'],
    ['human', '{input}'],
    ['placeholder', '{agent_scratchpad}']
  ])
})

const agentExecutor = new AgentExecutor({ agent, tools })

const result = await agentExecutor.invoke({
  input: '${prompt}'
})

console.log(result.output)
        `.trim(),
        lang: 'ts'
      }

    case 'llamaindex':
      return {
        code: `
import { createLlamaIndexTools } from '@agentic/llamaindex'
import { AgenticToolClient } from '@agentic/platform-tool-client'
import { openai } from '@llamaindex/openai'
import { agent } from '@llamaindex/workflow'

const searchTool = await AgenticToolClient.fromIdentifier('${identifier}')

const exampleAgent = agent({
  llm: openai({ model: 'gpt-4o-mini', temperature: 0 }),
  tools: createLlamaIndexTools(searchTool)
})

const response = await exampleAgent.run(
  '${prompt}'
)

console.log(response.data.result)
        `.trim(),
        lang: 'ts'
      }

    case 'mastra':
      return {
        code: `
import { createMastraTools } from '@agentic/mastra'
import { AgenticToolClient } from '@agentic/platform-tool-client'
import { openai } from '@ai-sdk/openai'
import { Agent } from '@mastra/core/agent'

const searchTool = await AgenticToolClient.fromIdentifier('${identifier}')

const exampleAgent = new Agent({
  name: 'Example Agent',
  model: openai('gpt-4o-mini') as any,
  instructions: 'You are a helpful assistant. Be as concise as possible.',
  tools: createMastraTools(searchTool)
})

const res = await exampleAgent.generate(
  '${prompt}'
)

console.log(res.text)`.trim(),
        lang: 'ts'
      }

    case 'firebase-genkit':
      return {
        code: `
import { createGenkitTools } from '@agentic/genkit'
import { AgenticToolClient } from '@agentic/platform-tool-client'
import { genkit } from 'genkit'
import { gpt4oMini, openAI } from 'genkitx-openai'

const searchTool = await AgenticToolClient.fromIdentifier('${identifier}')

const ai = genkit({
  plugins: [openAI()]
})

const result = await ai.generate({
  model: gpt4oMini,
  tools: createGenkitTools(ai, searchTool),
  prompt: '${prompt}'
})

console.log(result)`.trim(),
        lang: 'ts'
      }

    case 'xsai':
      return {
        code: `
import { AgenticToolClient } from '@agentic/platform-tool-client'
import { createXSAITools } from '@agentic/xsai'
import { generateText } from 'xsai'

const searchTool = await AgenticToolClient.fromIdentifier('${identifier}')

const result = await generateText({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  model: 'gpt-4o-mini',
  tools: await createXSAITools(searchTool),
  toolChoice: 'required',
  messages: [
    {
      role: 'user',
      content: '${prompt}'
    }
  ]
})

console.log(JSON.stringify(result, null, 2))`.trim(),
        lang: 'ts'
      }
  }
}

export function getCodeForPythonFrameworkConfig(_opts: {
  config: DeveloperConfig
  project: Project
  deployment: Deployment
  identifier: string
  tool?: string
}): CodeSnippet {
  return {
    code: 'Python SDK is coming soon. For now, use the MCP or HTTP examples',
    lang: 'md'
  }
}

export function getCodeForHTTPConfig({
  config,
  identifier,
  deployment,
  tool
}: {
  config: DeveloperConfig
  deployment: Deployment
  identifier: string
  tool?: string
}): CodeSnippet {
  tool ??= deployment.tools[0]?.name
  assert(tool, 'tool is required')
  // TODO: need a way of getting example tool args

  const url = `${gatewayBaseUrl}/${identifier}/${tool}`

  switch (config.httpTarget) {
    case 'curl':
      return {
        code: `curl -X POST -H "Content-Type: application/json" -d '{"query": "example google search"}' ${url}`,
        lang: 'bash'
      }

    case 'httpie':
      return {
        code: `http -j ${url} query='example google search'`,
        lang: 'bash'
      }
  }
}
