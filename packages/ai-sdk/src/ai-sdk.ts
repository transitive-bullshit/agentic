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

/**
 * Converts a set of Agentic stdlib AI functions to an object compatible with
 * the Vercel AI SDK's `tools` parameter.
 */
export function createAISDKTools(
  ...aiFunctionLikeTools: AIFunctionLike[]
): Record<
  string,
  Tool & { execute: (args: any, options: any) => PromiseLike<any> }
> {
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

export async function createAISDKToolsFromIdentifier(
  projectOrDeploymentIdentifier: string,
  opts: AgenticToolClientOptions = {}
) {
  const toolClient = await AgenticToolClient.fromIdentifier(
    projectOrDeploymentIdentifier,
    opts
  )

  return createAISDKTools(toolClient)
}
