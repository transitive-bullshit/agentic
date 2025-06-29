import type { Genkit } from 'genkit'
import {
  type AIFunctionLike,
  AIFunctionSet,
  asZodOrJsonSchema,
  isZodSchema
} from '@agentic/core'
import {
  AgenticToolClient,
  type AgenticToolClientOptions
} from '@agentic/platform-tool-client'
import { z } from 'zod'

export type GenkitTool = ReturnType<Genkit['defineTool']>

/**
 * Converts a set of Agentic stdlib AI functions to an array of Genkit tools.
 */
export function createGenkitTools(
  genkit: Genkit,
  ...aiFunctionLikeTools: AIFunctionLike[]
): GenkitTool[] {
  const fns = new AIFunctionSet(aiFunctionLikeTools)

  return fns.map((fn) => {
    const inputSchemaKey = isZodSchema(fn.inputSchema)
      ? ('inputSchema' as const)
      : ('inputJsonSchema' as const)

    return genkit.defineTool(
      {
        name: fn.spec.name,
        description: fn.spec.description,
        [inputSchemaKey]: asZodOrJsonSchema(fn.inputSchema),
        outputSchema: z.any()
      },
      fn.execute
    )
  })
}

/**
 * Creates an array of Genkit tools from a hosted Agentic project or deployment
 * identifier.
 *
 * You'll generally use a project identifier, which will automatically use
 * that project's `latest` version, but if you want to target a specific
 * version or preview deployment, you can use a fully-qualified deployment
 * identifier.
 *
 * @example
 * ```ts
 * const genkit = new Genkit()
 * const tools = await createGenkitToolsFromIdentifier(genkit, '@agentic/search')
 * ```
 */
export async function createGenkitToolsFromIdentifier(
  genkit: Genkit,
  projectOrDeploymentIdentifier: string,
  opts: AgenticToolClientOptions = {}
): Promise<GenkitTool[]> {
  const agenticToolClient = await AgenticToolClient.fromIdentifier(
    projectOrDeploymentIdentifier,
    opts
  )

  return createGenkitTools(genkit, agenticToolClient)
}
