import { type AIFunctionLike, AIFunctionSet } from '@agentic/core'
import { FunctionTool } from 'llamaindex'

/**
 * Converts a set of Agentic stdlib AI functions to an array of LlamaIndex-
 * compatible tools.
 */
export function createLlamaIndexTools(
  ...aiFunctionLikeTools: AIFunctionLike[]
) {
  const fns = new AIFunctionSet(aiFunctionLikeTools)

  return fns.map((fn) =>
    FunctionTool.from(fn.impl, {
      name: fn.spec.name,
      description: fn.spec.description,
      parameters: fn.spec.parameters as any
    })
  )
}
