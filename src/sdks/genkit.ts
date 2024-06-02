import { defineTool } from '@genkit-ai/ai'
import { z } from 'zod'

import type { AIFunctionSet } from '../ai-function-set.js'
import { AIToolsProvider } from '../fns.js'

/**
 * Converts a set of Agentic stdlib AI functions to an array of Genkit-
 * compatible tools.
 */
export function createGenkitTools(input: AIToolsProvider | AIFunctionSet) {
  const fns = input instanceof AIToolsProvider ? input.functions : input

  return fns.map((fn) =>
    defineTool(
      {
        name: fn.spec.name,
        description: fn.spec.description,
        inputSchema: fn.inputSchema,
        outputSchema: z.any()
      },
      fn.impl
    )
  )
}
