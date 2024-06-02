import { tool } from 'ai'

import type { AIFunctionSet } from '../ai-function-set.js'
import { AIToolsProvider } from '../fns.js'

export function tools(tools: AIToolsProvider | AIFunctionSet) {
  const fns = tools instanceof AIToolsProvider ? tools.functions : tools

  return Object.fromEntries(
    [...fns].map((fn) => [
      fn.spec.name,
      tool({
        description: fn.spec.description,
        parameters: fn.inputSchema,
        execute: fn.impl
      })
    ])
  )
}
