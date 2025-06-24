import type { Deployment, Project } from '@agentic/platform-types'
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
  any: 'Any MCP Client',
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
  mastra: 'Mastra',
  llamaindex: 'LlamaIndex',
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
  mcpClientTarget: 'any',
  tsFrameworkTarget: 'ai',
  pyFrameworkTarget: 'openai',
  httpTarget: 'curl'
}

export function getCodeForDeveloperConfig(opts: {
  config: DeveloperConfig
  project: Project
  deployment: Deployment
  identifier: string
  tool?: string
}): string {
  const { config } = opts

  switch (config.target) {
    case 'mcp':
      return getCodeForMCPClientConfig(opts)
    case 'typescript':
      return getCodeForTSFrameworkConfig(opts)
    case 'python':
      return 'Python support is coming soon...'
    // return getCodeForPythonFrameworkConfig(opts)
    case 'http':
      return getCodeForHTTPConfig(opts)
  }
}

export function getCodeForMCPClientConfig({
  identifier
}: {
  identifier: string
}): string {
  return `${gatewayBaseUrl}/${identifier}/mcp`
}

export function getCodeForTSFrameworkConfig({
  config,
  identifier
}: {
  config: DeveloperConfig
  identifier: string
}): string {
  switch (config.tsFrameworkTarget) {
    case 'ai':
      return `
import { createAISDKTools } from '@agentic/ai'
import { AgenticToolClient } from '@agentic/platform-tool-client'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

const searchTool = await AgenticToolClient.fromIdentifier('${identifier}')

const result = await generateText({
  model: openai('gpt-4o-mini'),
  tools: createAISDKTools(searchTool),
  toolChoice: 'required',
  temperature: 0,
  system: 'You are a helpful assistant. Be as concise as possible.',
  prompt: 'What is the latest news about AI?'
})

console.log(result.toolResults[0])
      `.trim()

    case 'openai-chat':
      return `
import { AgenticToolClient } from '@agentic/platform-tool-client'
import OpenAI from 'openai'

const openai = new OpenAI()
const searchTool = await AgenticToolClient.fromIdentifier('${identifier}')

const res = await openai.chat.completions.create({
  messages: [
   {
      role: 'system',
      content: 'You are a helpful assistant. Be as concise as possible.'
    }
    {
      role: 'user',
      content: 'What is the latest news about AI?'
    }
  ],
  model: 'gpt-4o-mini',
  temperature: 0,
  tools: searchTool.functions.toolSpecs,
  tool_choice: 'required'
})

const message = res.choices[0]!.message!
const toolCall = message.tool_calls![0]!

const tool = searchTool.functions.get(toolCall.function.name)!
const toolResult = await tool(toolCall.function.arguments)

console.log(toolResult)
`.trim()
  }

  return ''
}

// export function getCodeForPythonFrameworkConfig({
//   config,
//   project,
//   deployment,
//   tool
// }: {
//   config: DeveloperConfig
//   project: Project
//   deployment: Deployment
//   identifier: string
//   tool?: string
// }): string {
//   return ''
// }

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
}): string {
  tool ??= deployment.tools[0]?.name
  assert(tool, 'tool is required')
  // TODO: need a way of getting example tool args

  const url = `${gatewayBaseUrl}/${identifier}/${tool}`

  switch (config.httpTarget) {
    case 'curl':
      return `curl -X POST -H "Content-Type: application/json" -d '{"query": "example google search"}' ${url}`

    case 'httpie':
      return `http -j ${url} query='example google search'`
  }
}
