import { assert } from '@agentic/platform-core'

import type { AdminConsumer, GatewayHonoContext } from './types'

export async function getAdminConsumer(
  ctx: GatewayHonoContext,
  token: string
): Promise<AdminConsumer> {
  const client = ctx.get('client')
  const consumer = await client.adminGetConsumerByToken({
    token,
    populate: ['user']
  })
  assert(consumer, 404, `API token not found "${token}"`)

  return consumer
}
