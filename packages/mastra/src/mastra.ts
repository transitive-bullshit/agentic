import { type AIFunctionLike, AIFunctionSet, isZodSchema } from '@agentic/core'
import { createTool } from '@mastra/core/tools'

/**
 * Converts a set of Agentic stdlib AI functions to an object compatible with
 * the Mastra Agent `tools` format.
 */
export function createMastraTools(...aiFunctionLikeTools: AIFunctionLike[]) {
  const fns = new AIFunctionSet(aiFunctionLikeTools)

  return Object.fromEntries(
    fns.map((fn) => {
      if (!isZodSchema(fn.inputSchema)) {
        throw new Error(
          `Mastra tools only support Zod schemas: ${fn.spec.name} tool uses a custom JSON Schema, which is currently not supported.`
        )
      }

      return [
        fn.spec.name,
        createTool({
          id: fn.spec.name,
          description: fn.spec.description,
          inputSchema: fn.inputSchema,
          execute: (ctx) => fn.execute(ctx.context)
        })
      ]
    })
  )
}
