import type { Deployment, Project } from '@agentic/platform-types'
import type { BundledLanguage } from 'shiki/bundle/web'
import type { Simplify } from 'type-fest'
import { assert, pruneUndefined } from '@agentic/platform-core'

import { gatewayBaseUrl } from './config'

export const targetLabels = {
  mcp: 'MCP',
  typescript: 'TypeScript',
  python: 'Python',
  http: 'HTTP'
} as const
export const targets = Object.keys(
  targetLabels
) as (keyof typeof targetLabels)[]
export type Target = (typeof targets)[number]

export const httpTargetLabels = {
  curl: 'cURL',
  httpie: 'HTTPie'
} as const
export const httpTargets = Object.keys(
  httpTargetLabels
) as (keyof typeof httpTargetLabels)[]
export type HTTPTarget = (typeof httpTargets)[number]

export const mcpClientTargetLabels = {
  url: 'MCP Server URL',
  'mcp-json': 'mcp.json',
  cursor: 'Cursor',
  'claude-code': 'Claude Code',
  'claude-desktop': 'Claude Desktop',
  // chatgpt: 'ChatGPT', // TODO
  raycast: 'Raycast',
  trae: 'Trae',
  windsurf: 'Windsurf',
  vscode: 'VSCode',
  cline: 'Cline',
  warp: 'Warp'
} as const
export const mcpClientTargets = Object.keys(
  mcpClientTargetLabels
) as (keyof typeof mcpClientTargetLabels)[]
export type MCPClientTarget = (typeof mcpClientTargets)[number]

export const tsFrameworkTargetLabels = {
  ai: 'Vercel AI SDK',
  'openai-chat': 'OpenAI Chat',
  'openai-responses': 'OpenAI Responses',
  langchain: 'LangChain',
  llamaindex: 'LlamaIndex',
  mastra: 'Mastra',
  'firebase-genkit': 'Firebase GenKit'

  // TODO: add https://github.com/googleapis/js-genai

  // TODO: get xsai adapter working with JSON schemas (currently only standard schemas)
  // xsai: 'xsAI'
} as const
export const tsFrameworkTargets = Object.keys(
  tsFrameworkTargetLabels
) as (keyof typeof tsFrameworkTargetLabels)[]
export type TsFrameworkTarget = (typeof tsFrameworkTargets)[number]

export const pyFrameworkTargetLabels = {
  openai: 'OpenAI',
  langchain: 'LangChain',
  llamaindex: 'LlamaIndex'
} as const
export const pyFrameworkTargets = Object.keys(
  pyFrameworkTargetLabels
) as (keyof typeof pyFrameworkTargetLabels)[]
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
  action?: {
    href: string
    label: string
    logoImageUrl?: string
    logoImageUrlDark?: string
    logoImageUrlLight?: string
  }
}

export type GetCodeForDeveloperConfigOpts = {
  config: DeveloperConfig
  project: Project
  deployment: Deployment
  identifier: string
  tool?: string
  apiKey?: string
}

type GetCodeForDeveloperConfigInnerOpts = Simplify<
  GetCodeForDeveloperConfigOpts & {
    systemPrompt: string
    prompt: string
    args: Record<string, any>
  }
>

export function getCodeForDeveloperConfig(
  opts: GetCodeForDeveloperConfigOpts
): CodeSnippet {
  const { config, tool } = opts

  const toolConfig = tool
    ? opts.deployment.toolConfigs.find((toolConfig) => toolConfig.name === tool)
    : undefined
  const toolConfigExample =
    toolConfig?.examples?.find((example) => example.featured) ??
    toolConfig?.examples?.[0]

  const innerOpts: GetCodeForDeveloperConfigInnerOpts = {
    ...opts,

    // TODO: incorporate the system message into all of the example TS and
    // Python code snippets
    systemPrompt:
      toolConfigExample?.systemPrompt ??
      'You are a helpful assistant. Be as concise as possible.',

    // TODO: generate this default on the backend based on the tool's name,
    // description, inputSchema, and outputSchema
    prompt: toolConfigExample?.prompt ?? 'What is the latest news about AI?',

    // TODO: generate this default on the backend based on the tool's input
    // schema
    // TODO: if no `args` are provided, hide the `HTTP` tab?
    args: toolConfigExample?.args ?? {
      query: 'example search query'
    }
  }

  switch (config.target) {
    case 'mcp':
      return getCodeForMCPClientConfig(innerOpts)

    case 'typescript':
      return getCodeForTSFrameworkConfig(innerOpts)

    case 'python':
      return getCodeForPythonFrameworkConfig(innerOpts)

    case 'http':
      return getCodeForHTTPConfig(innerOpts)
  }
}

export function getCodeForMCPClientConfig({
  config,
  identifier,
  project,
  apiKey
}: GetCodeForDeveloperConfigInnerOpts): CodeSnippet {
  const mcpUrl = `${gatewayBaseUrl}/${identifier}/mcp${
    apiKey ? `?apiKey=${apiKey}` : ''
  }`

  const mcpConfig = {
    mcpServers: {
      [identifier]: {
        url: mcpUrl
      }
    }
  }
  const mcpConfigCode = JSON.stringify(mcpConfig, null, 2)

  const mcpRemoteConfig = {
    mcpServers: {
      [identifier]: {
        command: 'npx',
        args: ['mcp-remote', '-y', mcpUrl]
      }
    }
  }
  const mcpRemoteConfigCode = JSON.stringify(mcpRemoteConfig, null, 2)

  switch (config.mcpClientTarget) {
    case 'url':
      return {
        code: mcpUrl,
        lang: 'bash'
      }

    case 'mcp-json':
      return {
        code: mcpConfigCode,
        lang: 'json'
      }

    case 'claude-code':
      return {
        code: `claude mcp add --transport http "${identifier}" "${mcpUrl}"`,
        lang: 'bash'
      }

    case 'cursor': {
      const config = Buffer.from(JSON.stringify(mcpConfig)).toString('base64')
      const href = `cursor://anysphere.cursor-deeplink/mcp/install?name=${identifier}&config=${config}`

      return {
        code: mcpConfigCode,
        lang: 'json',
        action: {
          href,
          label: `Add the ${identifier} MCP server to Cursor`,
          logoImageUrlLight: '/assets/mcp-clients/cursor-icon-light.svg',
          logoImageUrlDark: '/assets/mcp-clients/cursor-icon-dark.webp'
        }
      }
    }

    case 'windsurf':
      return {
        code: mcpRemoteConfigCode,
        lang: 'json'
      }

    case 'claude-desktop':
      return {
        code: mcpRemoteConfigCode,
        lang: 'json'
      }

    case 'raycast': {
      // https://manual.raycast.com/model-context-protocol
      const customMcpConfig = pruneUndefined({
        name: identifier,
        type: 'http',
        url: mcpUrl,
        description: project.lastPublishedDeployment?.description
      })
      const customMcpConfigCode = JSON.stringify(customMcpConfig)
      const href = `raycast://mcp/install?${encodeURIComponent(customMcpConfigCode)}`

      return {
        code: mcpConfigCode,
        lang: 'json',
        action: {
          href,
          label: `Add the ${identifier} MCP server to Raycast`,
          logoImageUrlLight: '/assets/mcp-clients/raycast-icon-light.svg',
          logoImageUrlDark: '/assets/mcp-clients/raycast-icon-dark.svg'
        }
      }
    }

    case 'vscode':
      return {
        code: `
"mcp": {
  "servers": {
    "${identifier}": {
      "type": "http",
      "url": "${mcpUrl}"
    }
  }
}`.trim(),
        lang: 'json'
      }

    default:
      return {
        code: mcpConfigCode,
        lang: 'json'
      }
  }
}

export function getCodeForTSFrameworkConfig({
  config,
  identifier,
  prompt,
  systemPrompt,
  apiKey
}: GetCodeForDeveloperConfigInnerOpts): CodeSnippet {
  switch (config.tsFrameworkTarget) {
    case 'ai':
      return {
        code: `
import { createAISDKTools } from '@agentic/ai-sdk'
import { AgenticToolClient } from '@agentic/platform-tool-client'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

const searchTool = await AgenticToolClient.fromIdentifier('${identifier}'${
          apiKey
            ? `, {
  apiKey: '${apiKey}'
}`
            : ''
        })

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
const searchTool = await AgenticToolClient.fromIdentifier('${identifier}'${
          apiKey
            ? `, {
  apiKey: '${apiKey}'
}`
            : ''
        })

// This example uses OpenAI's Chat Completions API
const res = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  tools: searchTool.functions.toolSpecs,
  tool_choice: 'required',
  messages: [
    {
      role: 'user',
      content: '${prompt}'
    }
  ]
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
const searchTool = await AgenticToolClient.fromIdentifier('${identifier}'${
          apiKey
            ? `, {
  apiKey: '${apiKey}'
}`
            : ''
        })

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
assert(toolCall?.type === 'function_call')
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

const searchTool = await AgenticToolClient.fromIdentifier('${identifier}'${
          apiKey
            ? `, {
  apiKey: '${apiKey}'
}`
            : ''
        })

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

const searchTool = await AgenticToolClient.fromIdentifier('${identifier}'${
          apiKey
            ? `, {
  apiKey: '${apiKey}'
}`
            : ''
        })

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

const searchTool = await AgenticToolClient.fromIdentifier('${identifier}'${
          apiKey
            ? `, {
  apiKey: '${apiKey}'
}`
            : ''
        })

const exampleAgent = new Agent({
  name: 'Example Agent',
  model: openai('gpt-4o-mini'),
  tools: createMastraTools(searchTool),
  instructions: '${systemPrompt}'
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

const searchTool = await AgenticToolClient.fromIdentifier('${identifier}'${
          apiKey
            ? `, {
  apiKey: '${apiKey}'
}`
            : ''
        })

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
  }
}

export function getCodeForPythonFrameworkConfig({
  config,
  identifier,
  prompt,
  apiKey
}: GetCodeForDeveloperConfigInnerOpts): CodeSnippet {
  const mcpUrl = `${gatewayBaseUrl}/${identifier}/mcp${
    apiKey ? `?apiKey=${apiKey}` : ''
  }`

  switch (config.pyFrameworkTarget) {
    case 'openai':
      return {
        code: `
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-4.1",
    tools=[
        {
            "type": "mcp",
            "server_label": "${identifier}",
            "server_url": "${mcpUrl}",
            "require_approval": "never",
        },
    ],
    input="${prompt}",
)

print(response.output_text)
        `.trim(),
        lang: 'py'
      }

    case 'langchain':
      return {
        code: `
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent

client = MultiServerMCPClient(
    {
        "search": {
            "url": "${mcpUrl}",
            "transport": "streamable_http",
        }
    }
)
tools = await client.get_tools()
agent = create_react_agent(
    "anthropic:claude-3-7-sonnet-latest",
    tools
)
response = await agent.ainvoke(
    {"messages": [{"role": "user", "content": "${prompt}"}]}
)`.trim(),
        lang: 'py'
      }

    case 'llamaindex':
      return {
        code: `
from llama_index.llms.openai import OpenAI
from llama_index.core.agent.workflow import ReActAgent
from llama_index.core.workflow import Context

from llama_index.tools.mcp import (
    get_tools_from_mcp_url,
    aget_tools_from_mcp_url,
)

tools = await aget_tools_from_mcp_url("${mcpUrl}")

llm = OpenAI(model="gpt-4o-mini")
agent = ReActAgent(tools=tools, llm=llm)
ctx = Context(agent)
response = await agent.run("${prompt}", ctx=ctx)

print(str(response))
        `.trim(),
        lang: 'py'
      }
  }
}

export function getCodeForHTTPConfig({
  config,
  identifier,
  deployment,
  tool,
  args,
  apiKey
}: GetCodeForDeveloperConfigInnerOpts): CodeSnippet {
  tool ??= deployment.tools[0]?.name
  assert(tool, 'tool is required')
  // TODO: need a way of getting example tool args

  const url = `${gatewayBaseUrl}/${identifier}/${tool}`

  switch (config.httpTarget) {
    case 'curl': {
      const formattedArgs = JSON.stringify(args).replace("'", "\\'")

      // TODO: better formatting for the curl command
      return {
        code: `curl -X POST -H "Content-Type: application/json"${
          apiKey ? ` -H "Authorization: Bearer ${apiKey}"` : ''
        } -d '${formattedArgs}' ${url}`,
        lang: 'bash'
      }
    }

    case 'httpie': {
      const formattedArgs = Object.entries(args)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(' ')

      return {
        code: `http ${url}${apiKey ? ` Authorization:"Bearer ${apiKey}"` : ''}${
          formattedArgs ? ` ${formattedArgs}` : ''
        }`,
        lang: 'bash'
      }
    }
  }
}
