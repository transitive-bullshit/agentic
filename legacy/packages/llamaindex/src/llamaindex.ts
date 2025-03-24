import {
  type AIFunctionLike,
  AIFunctionSet,
  asZodOrJsonSchema
} from '@agentic/core'
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
    FunctionTool.from(fn.execute, {
      name: fn.spec.name,
      description: fn.spec.description,
      // TODO: Investigate types here
      parameters: asZodOrJsonSchema(fn.inputSchema) as any
    })
  )
}
