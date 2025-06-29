import {
  type AIFunctionLike,
  AIFunctionSet,
  asZodOrJsonSchema
} from '@agentic/core'
import {
  AgenticToolClient,
  type AgenticToolClientOptions
} from '@agentic/platform-tool-client'
import { FunctionTool, type JSONValue } from 'llamaindex'

export type LlamaIndexTool = FunctionTool<any, JSONValue | Promise<JSONValue>>

/**
 * Converts a set of Agentic stdlib AI functions to an array of LlamaIndex
 * tools (`FunctionTool[]`).
 */
export function createLlamaIndexTools(
  ...aiFunctionLikeTools: AIFunctionLike[]
): LlamaIndexTool[] {
  const fns = new AIFunctionSet(aiFunctionLikeTools)

  return fns.map((fn) =>
    FunctionTool.from(fn.execute, {
      name: fn.spec.name,
      description: fn.spec.description,
      // TODO: Investigate types here
      parameters: asZodOrJsonSchema(fn.inputSchema) as any
    })
  )
}

/**
 * Creates an array of LlamaIndex tools from a hosted Agentic project or
 * deployment identifier.
 *
 * You'll generally use a project identifier, which will automatically use
 * that project's `latest` version, but if you want to target a specific
 * version or preview deployment, you can use a fully-qualified deployment
 * identifier.
 *
 * @example
 * ```ts
 * const tools = await createLlamaIndexToolsFromIdentifier('@agentic/search')
 * ```
 */
export async function createLlamaIndexToolsFromIdentifier(
  projectOrDeploymentIdentifier: string,
  opts: AgenticToolClientOptions = {}
): Promise<LlamaIndexTool[]> {
  const agenticToolClient = await AgenticToolClient.fromIdentifier(
    projectOrDeploymentIdentifier,
    opts
  )

  return createLlamaIndexTools(agenticToolClient)
}
