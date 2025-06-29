import { type AIFunctionLike, AIFunctionSet, isZodSchema } from '@agentic/core'
import {
  AgenticToolClient,
  type AgenticToolClientOptions
} from '@agentic/platform-tool-client'
import { createTool } from '@mastra/core/tools'

export type MastraTool = ReturnType<typeof createTool>

/**
 * Converts a set of Agentic stdlib AI functions to an object compatible with
 * the Mastra Agent `tools` parameter.
 */
export function createMastraTools(
  ...aiFunctionLikeTools: AIFunctionLike[]
): Record<string, MastraTool> {
  const fns = new AIFunctionSet(aiFunctionLikeTools)

  return Object.fromEntries(
    fns.map((fn) => {
      if (!isZodSchema(fn.inputSchema)) {
        throw new Error(
          `Mastra tools only support Zod schemas: ${fn.spec.name} tool uses a custom JSON Schema, which is currently not supported.`
        )
      }

      return [
        fn.spec.name,
        createTool({
          id: fn.spec.name,
          description: fn.spec.description,
          inputSchema: fn.inputSchema,
          execute: (ctx) => fn.execute(ctx.context)
        })
      ]
    })
  )
}

/**
 * Creates a Mastra Agent `tools` object from a hosted Agentic project or
 * deployment identifier.
 *
 * You'll generally use a project identifier, which will automatically use
 * that project's `latest` version, but if you want to target a specific
 * version or preview deployment, you can use a fully-qualified deployment
 * identifier.
 *
 * @example
 * ```ts
 * const tools = await createMastraToolsFromIdentifier('@agentic/search')
 * ```
 */
export async function createMastraToolsFromIdentifier(
  projectOrDeploymentIdentifier: string,
  opts: AgenticToolClientOptions = {}
): Promise<Record<string, MastraTool>> {
  const agenticToolClient = await AgenticToolClient.fromIdentifier(
    projectOrDeploymentIdentifier,
    opts
  )

  return createMastraTools(agenticToolClient)
}
