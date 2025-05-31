import { assert } from '@agentic/platform-core'

import type { AdminConsumer, Context } from './types'

export async function getAdminConsumer(
  ctx: Context,
  token: string
): Promise<AdminConsumer> {
  const consumer = await ctx.client.adminGetConsumerByToken({
    token,
    populate: ['user']
  })
  assert(consumer, 404, `API token not found "${token}"`)

  return consumer
}
