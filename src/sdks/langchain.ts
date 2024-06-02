import { DynamicStructuredTool } from '@langchain/core/tools'

import type { AIFunctionSet } from '../ai-function-set.js'
import { AIToolsProvider } from '../fns.js'
import { stringifyForModel } from '../stringify-for-model.js'

/**
 * Converts a set of Agentic stdlib AI functions to an array of LangChain-
 * compatible tools.
 */
export function createLangChainTools(input: AIToolsProvider | AIFunctionSet) {
  const fns = input instanceof AIToolsProvider ? input.functions : input

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
