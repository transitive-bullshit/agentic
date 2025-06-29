import {
  type AIFunctionLike,
  AIFunctionSet,
  asAgenticSchema,
  isZodSchema
} from '@agentic/core'
import {
  AgenticToolClient,
  type AgenticToolClientOptions
} from '@agentic/platform-tool-client'
import { createTool } from '@mastra/core/tools'
import { convertSchemaToZod } from '@mastra/schema-compat'
import { jsonSchema } from 'ai'

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
      // https://github.com/mastra-ai/mastra/tree/main/packages/schema-compat
      const aiSchema = isZodSchema(fn.inputSchema)
        ? fn.inputSchema
        : jsonSchema(asAgenticSchema(fn.inputSchema).jsonSchema)
      const inputSchema = convertSchemaToZod(aiSchema)

      return [
        fn.spec.name,
        createTool({
          id: fn.spec.name,
          description: fn.spec.description,
          inputSchema,
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
