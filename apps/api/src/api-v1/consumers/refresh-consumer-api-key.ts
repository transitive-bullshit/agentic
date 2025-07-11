import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { acl } from '@/lib/acl'
import { createConsumerApiKey } from '@/lib/create-consumer-api-key'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { consumerIdParamsSchema } from './schemas'

const route = createRoute({
  description: "Refreshes a consumer's API key.",
  tags: ['consumers'],
  operationId: 'refreshConsumerApiKey',
  method: 'post',
  path: 'consumers/{consumerId}/refresh-api-key',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    params: consumerIdParamsSchema
  },
  responses: {
    200: {
      description: 'A consumer object',
      content: {
        'application/json': {
          schema: schema.consumerSelectSchema
        }
      }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

export function registerV1RefreshConsumerApiKey(
  app: OpenAPIHono<AuthenticatedHonoEnv>
) {
  return app.openapi(route, async (c) => {
    const { consumerId } = c.req.valid('param')

    let consumer = await db.query.consumers.findFirst({
      where: eq(schema.consumers.id, consumerId)
    })
    assert(consumer, 404, 'Consumer not found')
    await acl(c, consumer, { label: 'Consumer' })

    // Update the consumer's API token
    ;[consumer] = await db
      .update(schema.consumers)
      .set({
        token: await createConsumerApiKey()
      })
      .where(eq(schema.consumers.id, consumer.id))
      .returning()
    assert(consumer, 500, 'Error updating consumer')

    return c.json(parseZodSchema(schema.consumerSelectSchema, consumer))
  })
}
