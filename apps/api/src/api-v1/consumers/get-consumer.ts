import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { acl } from '@/lib/acl'
import { assert, parseZodSchema } from '@/lib/utils'

import { consumerIdParamsSchema } from './schemas'

const route = createRoute({
  description: 'Gets a consumer',
  tags: ['consumers'],
  operationId: 'getConsumer',
  method: 'get',
  path: 'consumers/{consumersId}',
  security: [{ bearerAuth: [] }],
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
    }
    // TODO
    // ...openApiErrorResponses
  }
})

export function registerV1ConsumersGetConsumer(
  app: OpenAPIHono<AuthenticatedEnv>
) {
  return app.openapi(route, async (c) => {
    const { consumerId } = c.req.valid('param')

    const consumer = await db.query.consumers.findFirst({
      where: eq(schema.consumers.id, consumerId)
    })
    assert(consumer, 404, `Consumer not found "${consumerId}"`)
    await acl(c, consumer, { label: 'Consumer' })

    return c.json(parseZodSchema(schema.consumerSelectSchema, consumer))
  })
}
