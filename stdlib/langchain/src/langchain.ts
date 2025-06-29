import {
  type AIFunctionLike,
  AIFunctionSet,
  asZodOrJsonSchema,
  stringifyForModel
} from '@agentic/core'
import {
  AgenticToolClient,
  type AgenticToolClientOptions
} from '@agentic/platform-tool-client'
import { DynamicStructuredTool } from '@langchain/core/tools'

/**
 * Converts a set of Agentic stdlib AI functions to an array of LangChain
 * tools (`DynamicStructuredTool[]`).
 */
export function createLangChainTools(
  ...aiFunctionLikeTools: AIFunctionLike[]
): DynamicStructuredTool[] {
  const fns = new AIFunctionSet(aiFunctionLikeTools)

  return fns.map(
    (fn) =>
      new DynamicStructuredTool({
        name: fn.spec.name,
        description: fn.spec.description,
        schema: asZodOrJsonSchema(fn.inputSchema),
        func: async (input) => {
          const result = await Promise.resolve(fn.execute(input))
          // LangChain tools require the output to be a string
          return stringifyForModel(result)
        }
      })
  )
}

/**
 * Creates a Vercel AI SDK's `tools` object from a hosted Agentic project or
 * deployment identifier.
 *
 * You'll generally use a project identifier, which will automatically use
 * that project's `latest` version, but if you want to target a specific
 * version or preview deployment, you can use a fully-qualified deployment
 * identifier.
 *
 * @example
 * ```ts
 * const tools = await createLangChainToolsFromIdentifier('@agentic/search')
 * ```
 */
export async function createLangChainToolsFromIdentifier(
  projectOrDeploymentIdentifier: string,
  opts: AgenticToolClientOptions = {}
): Promise<DynamicStructuredTool[]> {
  const agenticToolClient = await AgenticToolClient.fromIdentifier(
    projectOrDeploymentIdentifier,
    opts
  )

  return createLangChainTools(agenticToolClient)
}
