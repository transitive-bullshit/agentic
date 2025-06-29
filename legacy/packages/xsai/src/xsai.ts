import { type AIFunctionLike, AIFunctionSet, isZodSchema } from '@agentic/core'
import {
  AgenticToolClient,
  type AgenticToolClientOptions
} from '@agentic/platform-tool-client'
import { tool } from '@xsai/tool'

export type XSAITool = Awaited<ReturnType<typeof tool>>

/**
 * Converts a set of Agentic stdlib AI functions to an object compatible with
 * the [xsAI SDK's](https://github.com/moeru-ai/xsai) `tools` parameter.
 */
export function createXSAITools(
  ...aiFunctionLikeTools: AIFunctionLike[]
): Promise<XSAITool[]> {
  const fns = new AIFunctionSet(aiFunctionLikeTools)

  return Promise.all(
    fns.map((fn) => {
      if (!isZodSchema(fn.inputSchema)) {
        throw new Error(
          `xsAI tools only support Standard schemas like Zod: ${fn.spec.name} tool uses a custom JSON Schema, which is currently not supported.`
        )
      }

      return tool({
        name: fn.spec.name,
        description: fn.spec.description,
        parameters: fn.inputSchema,
        execute: fn.execute
      })
    })
  )
}

/**
 * Creates an array of xsAI tools from a hosted Agentic project or deployment
 * identifier.
 *
 * You'll generally use a project identifier, which will automatically use
 * that project's `latest` version, but if you want to target a specific
 * version or preview deployment, you can use a fully-qualified deployment
 * identifier.
 *
 * @example
 * ```ts
 * const tools = await createXSAIToolsFromIdentifier('@agentic/search')
 * ```
 */
export async function createXSAIToolsFromIdentifier(
  projectOrDeploymentIdentifier: string,
  opts: AgenticToolClientOptions = {}
): Promise<XSAITool[]> {
  const agenticToolClient = await AgenticToolClient.fromIdentifier(
    projectOrDeploymentIdentifier,
    opts
  )

  return createXSAITools(agenticToolClient)
}
