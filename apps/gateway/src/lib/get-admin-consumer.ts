import { assert, HttpError } from '@agentic/platform-core'

import type { AdminConsumer, GatewayHonoContext } from './types'

export async function getAdminConsumer(
  ctx: GatewayHonoContext,
  apiKey: string
): Promise<AdminConsumer> {
  const client = ctx.get('client')
  let consumer: AdminConsumer | undefined

  try {
    consumer = await client.adminGetConsumerByApiKey({
      apiKey,
      populate: ['user']
    })
  } catch (err: any) {
    if (err.response?.status === 404) {
      // Hide the underlying error message from the client
      throw new HttpError({
        statusCode: 404,
        message: `API key not found "${apiKey}"`,
        cause: err
      })
    }

    throw err
  }

  assert(consumer, 404, `API key not found "${apiKey}"`)
  return consumer
}
