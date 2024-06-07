import { createAIFunction } from '@dexaai/dexter'

import type { AIFunctionLike } from '../types.js'
import { AIFunctionSet } from '../ai-function-set.js'

/**
 * Converts a set of Agentic stdlib AI functions to an array of Dexter-
 * compatible AI functions.
 */
export function createDexterFunctions(
  ...aiFunctionLikeTools: AIFunctionLike[]
) {
  const fns = new AIFunctionSet(aiFunctionLikeTools)

  return fns.map((fn) =>
    createAIFunction(
      {
        name: fn.spec.name,
        description: fn.spec.description,
        argsSchema: fn.inputSchema
      },
      fn.impl
    )
  )
}
