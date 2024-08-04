import { z } from 'zod'

import { createAIFunction } from './create-ai-function'
import { aiFunction, AIFunctionsProvider } from './fns'

/**
 * Test AI tool with one function `echo`, which echoes the input.
 */
export class EchoAITool extends AIFunctionsProvider {
  @aiFunction({
    name: 'echo',
    description: 'Echoes the input.',
    inputSchema: z.object({
      query: z.string().describe('input query to echo')
    })
  })
  async echo({ query }: { query: string }) {
    return query
  }
}

/**
 * Test AI function `echo`, which echoes the input.
 */
export const echoAIFunction = createAIFunction(
  {
    name: 'echo',
    description: 'Echoes the input.',
    inputSchema: z.object({
      query: z.string().describe('input query to echo')
    })
  },
  ({ query }: { query: string }) => {
    return query
  }
)
