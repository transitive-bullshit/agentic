import { type AIFunctionLike, AIFunctionSet, isZodSchema } from '@agentic/core'
import { tool, type ToolResult } from '@xsai/tool'

/**
 * Converts a set of Agentic stdlib AI functions to an object compatible with
 * [the xsAI SDK's](https://github.com/moeru-ai/xsai) `tools` parameter.
 */
export function createXSAITools(
  ...aiFunctionLikeTools: AIFunctionLike[]
): Promise<ToolResult[]> {
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
