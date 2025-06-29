import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js'
import type {
  CallToolResult,
  ListToolsResult
} from '@modelcontextprotocol/sdk/types.js'
import {
  AIFunctionSet,
  AIFunctionsProvider,
  assert,
  createAIFunction,
  createJsonSchema
} from '@agentic/core'
import { Client as McpClient } from '@modelcontextprotocol/sdk/client/index.js'
import { type z } from 'zod'

import type { McpToolsFilter, McpToolsOptions } from './types'
import { paginate } from './paginate'

/**
 * Agentic tools provider wrapping an MCP client.
 *
 * You likely want to use `createMcpTools` to create an instance of `McpTools`
 * which enables exposing MCP server tools to the agentic ecosystem.
 *
 * @see https://modelcontextprotocol.io
 */
export class McpTools extends AIFunctionsProvider {
  readonly name: string
  readonly client: McpClient
  readonly rawToolResponses: boolean

  protected _toolsMap: Map<string, ListToolsResult['tools'][number]> | undefined
  protected readonly _toolsFilter: McpToolsFilter | undefined

  protected constructor({
    name,
    client,
    toolsFilter,
    rawToolResponses = false
  }: {
    client: McpClient
  } & McpToolsOptions) {
    super()

    this.name = name
    this.client = client
    this.rawToolResponses = rawToolResponses

    this._toolsFilter = toolsFilter
  }

  override get functions(): AIFunctionSet {
    assert(this._functions)
    return this._functions
  }

  /**
   * Initialize the McpTools instance by fetching all available tools from the MCP client.
   * This method must be called before using this class' tools.
   * It is called automatically when using `McpTools.from()`.
   */
  protected async _init() {
    const capabilties = this.client.getServerCapabilities()
    const initPromises: Promise<any>[] = []

    if (capabilties?.tools) {
      initPromises.push(this._initTools())
    }

    // TODO: handle prompts, resources, etc.
    await Promise.all(initPromises)
  }

  protected async _initTools() {
    const tools = await paginate({
      size: Infinity,
      handler: async ({ cursor }: { cursor?: string }) => {
        const { tools, nextCursor } = await this.client.listTools({ cursor })
        return { data: tools, nextCursor } as const
      }
    })

    const enabledTools = this._toolsFilter
      ? tools.filter((tool) => this._toolsFilter!(tool.name))
      : tools

    this._toolsMap = new Map(enabledTools.map((tool) => [tool.name, tool]))
    this._updateFunctions()
  }

  protected _updateFunctions() {
    assert(this._toolsMap)

    this._functions = new AIFunctionSet(
      Array.from(this._toolsMap.entries()).map(([_name, tool]) => {
        return createAIFunction(
          {
            name: `${this.name}_${tool.name}`,
            description: tool.description ?? `${this.name} ${tool.name}`,
            inputSchema: createJsonSchema(tool.inputSchema),
            strict: true
          },
          async (args) => {
            const result = await this.client.callTool({
              name: tool.name,
              arguments: args
            })

            if (this.rawToolResponses) {
              return result
            }

            return processToolCallResult(result as CallToolResult)
          }
        )
      })
    )
  }

  async callTool(name: string, args: z.infer<z.ZodObject<any>>) {
    const tool =
      this._toolsMap?.get(name) ?? this._toolsMap?.get(`${this.name}_${name}`)
    assert(tool, `Tool ${name} not found`)

    const result = await this.client.callTool({ name, arguments: args })
    return result
  }

  /**
   * Creates a new McpTools instance from an existing, fully initialized
   * MCP client.
   *
   * You probably want to use `createMcpTool` instead, which makes initializing
   * the MCP client and connecting to its transport easier.
   *
   * All tools within the `McpTools` instance will be namespaced under the given
   * `name`.
   */
  static async fromMcpClient(params: { client: McpClient } & McpToolsOptions) {
    const mcpTools = new McpTools(params)
    await mcpTools._init()
    return mcpTools
  }
}

/**
 * Creates a new McpTools instance by connecting to an MCP server. You must
 * provide either an existing `transport`, an existing `serverUrl`, or a
 * `serverProcess` to spawn.
 *
 * All tools within the `McpTools` instance will be namespaced under the given
 * `name`.
 */
export async function createMcpTools(
  params: McpToolsOptions
): Promise<McpTools> {
  const transport = await createMcpTransport(params)
  const client = new McpClient(
    { name: params.name, version: params.version || '1.0.0' },
    { capabilities: {} }
  )
  await client.connect(transport)

  return McpTools.fromMcpClient({ client, ...params })
}

/**
 * Creates a new MCP transport from either an existing `transport`, an existing
 * `serverUrl`, or a `serverProcess` to spawn.
 */
export async function createMcpTransport(
  params: McpToolsOptions
): Promise<Transport> {
  if (params.transport) return params.transport

  if (params.serverUrl) {
    const { SSEClientTransport } = await import(
      '@modelcontextprotocol/sdk/client/sse.js'
    )
    return new SSEClientTransport(new URL(params.serverUrl))
  }

  if (params.serverProcess) {
    const { StdioClientTransport } = await import(
      '@modelcontextprotocol/sdk/client/stdio.js'
    )
    return new StdioClientTransport(params.serverProcess)
  }

  throw new Error(
    'Unable to create a server connection with supplied options. Must provide transport, stdio, or sseUrl.'
  )
}

function toText(c: CallToolResult['content']) {
  return c.map((p) => p.text || '').join('')
}

function processToolCallResult(result: CallToolResult) {
  if (result.isError) return { error: toText(result.content) }

  if (result.content.every((c) => !!c.text)) {
    const text = toText(result.content)
    if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
      try {
        return JSON.parse(text)
      } catch {
        return text
      }
    }
    return text
  }

  if (result.content.length === 1) return result.content[0]
  return result
}
