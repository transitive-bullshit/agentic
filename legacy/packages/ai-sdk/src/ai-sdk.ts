import { type AIFunctionLike, AIFunctionSet } from '@agentic/core'
import { tool } from 'ai'

/**
 * Converts a set of Agentic stdlib AI functions to an object compatible with
 * the Vercel AI SDK's `tools` parameter.
 */
export function createAISDKTools(...aiFunctionLikeTools: AIFunctionLike[]) {
  const fns = new AIFunctionSet(aiFunctionLikeTools)

  return Object.fromEntries(
    fns.map((fn) => [
      fn.spec.name,
      tool({
        description: fn.spec.description,
        parameters: fn.inputSchema,
        execute: fn.impl
      })
    ])
  )
}
