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
import { jsonSchema, type Tool, tool } from 'ai'

export type AISDKTools = Record<
  string,
  Tool & { execute: (args: any, options: any) => PromiseLike<any> }
>

/**
 * Converts a set of Agentic stdlib AI functions to an object compatible with
 * the Vercel AI SDK's `tools` parameter.
 */
export function createAISDKTools(
  ...aiFunctionLikeTools: AIFunctionLike[]
): AISDKTools {
  const fns = new AIFunctionSet(aiFunctionLikeTools)

  return Object.fromEntries(
    fns.map((fn) => [
      fn.spec.name,
      tool({
        description: fn.spec.description,
        parameters: isZodSchema(fn.inputSchema)
          ? fn.inputSchema
          : jsonSchema(asAgenticSchema(fn.inputSchema).jsonSchema),
        execute: fn.execute
      })
    ])
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
 * const tools = await createAISDKToolsFromIdentifier('@agentic/search')
 * ```
 */
export async function createAISDKToolsFromIdentifier(
  projectOrDeploymentIdentifier: string,
  opts: AgenticToolClientOptions = {}
): Promise<AISDKTools> {
  const agenticToolClient = await AgenticToolClient.fromIdentifier(
    projectOrDeploymentIdentifier,
    opts
  )

  return createAISDKTools(agenticToolClient)
}
