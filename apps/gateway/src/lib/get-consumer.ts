import type { Consumer } from '@agentic/platform-api-client'
import { assert } from '@agentic/platform-core'

import type { Context } from './types'

export async function getConsumer(
  ctx: Context,
  token: string
): Promise<Consumer> {
  const consumer = await ctx.client.adminGetConsumerByToken({
    token
  })
  assert(consumer, 404, `API token not found "${token}"`)

  return consumer
}
