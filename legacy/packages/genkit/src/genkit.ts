import type { Genkit } from 'genkit'
import { type AIFunctionLike, AIFunctionSet } from '@agentic/core'
import { z } from 'zod'

/**
 * Converts a set of Agentic stdlib AI functions to an array of Genkit-
 * compatible tools.
 */
export function createGenkitTools(
  genkit: Genkit,
  ...aiFunctionLikeTools: AIFunctionLike[]
) {
  const fns = new AIFunctionSet(aiFunctionLikeTools)

  return fns.map((fn) =>
    genkit.defineTool(
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
