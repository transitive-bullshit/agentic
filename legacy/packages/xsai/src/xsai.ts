import { type AIFunctionLike, AIFunctionSet } from '@agentic/core'
import { tool, type ToolResult } from '@xsai/tool'

/**
 * Converts a set of Agentic stdlib AI functions to an object compatible with
 * [the xsAI SDK's](https://github.com/moeru-ai/xsai) `tools` parameter.
 */
export function createXSAISDKTools(
  ...aiFunctionLikeTools: AIFunctionLike[]
): Promise<ToolResult[]> {
  const fns = new AIFunctionSet(aiFunctionLikeTools)

  return Promise.all(
    fns.map((fn) =>
      tool({
        name: fn.spec.name,
        description: fn.spec.description,
        parameters: fn.inputSchema,
        execute: fn.impl
      })
    )
  )
}
