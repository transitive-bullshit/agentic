import type * as types from './types.js'
import { createAIChain } from './create-ai-chain.js'

export function extractObject<Result extends types.AIChainResult = string>(
  args: types.ExtractObjectParams<Result>
): Promise<Result> {
  const chain = createAIChain(args)
  return chain()
}
