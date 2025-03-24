import { type AIFunctionLike, AIFunctionSet, isZodSchema } from '@agentic/core'
import { createAIFunction } from '@dexaai/dexter'

/**
 * Converts a set of Agentic stdlib AI functions to an array of Dexter-
 * compatible AI functions.
 */
export function createDexterFunctions(
  ...aiFunctionLikeTools: AIFunctionLike[]
) {
  const fns = new AIFunctionSet(aiFunctionLikeTools)

  return fns.map((fn) => {
    if (!isZodSchema(fn.inputSchema)) {
      throw new Error(
        `Dexter tools only support Zod schemas: ${fn.spec.name} tool uses a custom JSON Schema, which is currently not supported.`
      )
    }

    return createAIFunction(
      {
        name: fn.spec.name,
        description: fn.spec.description,
        argsSchema: fn.inputSchema
      },
      fn.execute
    )
  })
}
