import { createAIFunction } from '@dexaai/dexter'

import type { AIFunctionSet } from '../ai-function-set.js'
import { AIToolsProvider } from '../fns.js'

export function functions(input: AIToolsProvider | AIFunctionSet) {
  const fns = input instanceof AIToolsProvider ? input.functions : input

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
