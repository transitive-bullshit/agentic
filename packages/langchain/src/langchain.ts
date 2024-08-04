import {
  type AIFunctionLike,
  AIFunctionSet,
  stringifyForModel
} from '@agentic/core'
import { DynamicStructuredTool } from '@langchain/core/tools'

/**
 * Converts a set of Agentic stdlib AI functions to an array of LangChain-
 * compatible tools.
 */
export function createLangChainTools(...aiFunctionLikeTools: AIFunctionLike[]) {
  const fns = new AIFunctionSet(aiFunctionLikeTools)

  return fns.map(
    (fn) =>
      new DynamicStructuredTool({
        name: fn.spec.name,
        description: fn.spec.description,
        schema: fn.inputSchema,
        func: async (input) => {
          const result = await Promise.resolve(fn.impl(input))
          // LangChain tools require the output to be a string
          return stringifyForModel(result)
        }
      })
  )
}
