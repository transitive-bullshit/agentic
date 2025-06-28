import type { Genkit } from 'genkit'
import {
  type AIFunctionLike,
  AIFunctionSet,
  asZodOrJsonSchema,
  isZodSchema
} from '@agentic/core'
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

  return fns.map((fn) => {
    const inputSchemaKey = isZodSchema(fn.inputSchema)
      ? ('inputSchema' as const)
      : ('inputJsonSchema' as const)

    return genkit.defineTool(
      {
        name: fn.spec.name,
        description: fn.spec.description,
        [inputSchemaKey]: asZodOrJsonSchema(fn.inputSchema),
        outputSchema: z.any()
      },
      fn.execute
    )
  })
}
