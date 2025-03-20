import { type AIFunctionLike, AIFunctionSet } from '@agentic/core'
import { createTool } from '@mastra/core/tools'

/**
 * Converts a set of Agentic stdlib AI functions to an object compatible with
 * the Mastra Agent `tools` format.
 */
export function createMastraTools(...aiFunctionLikeTools: AIFunctionLike[]) {
  const fns = new AIFunctionSet(aiFunctionLikeTools)

  return Object.fromEntries(
    fns.map((fn) => [
      fn.spec.name,
      createTool({
        id: fn.spec.name,
        description: fn.spec.description,
        inputSchema: fn.inputSchema,
        execute: (ctx) => fn.execute(ctx.context)
      })
    ])
  )
}
