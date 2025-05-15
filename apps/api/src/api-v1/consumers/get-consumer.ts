import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { acl } from '@/lib/acl'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'
import { assert, parseZodSchema } from '@/lib/utils'

import { consumerIdParamsSchema, populateConsumerSchema } from './schemas'

const route = createRoute({
  description: 'Gets a consumer',
  tags: ['consumers'],
  operationId: 'getConsumer',
  method: 'get',
  path: 'consumers/{consumersId}',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    params: consumerIdParamsSchema,
    query: populateConsumerSchema
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

export function registerV1ConsumersGetConsumer(
  app: OpenAPIHono<AuthenticatedEnv>
) {
  return app.openapi(route, async (c) => {
    const { consumerId } = c.req.valid('param')
    const { populate = [] } = c.req.valid('query')

    const consumer = await db.query.consumers.findFirst({
      where: eq(schema.consumers.id, consumerId),
      with: {
        ...Object.fromEntries(populate.map((field) => [field, true]))
      }
    })
    assert(consumer, 404, `Consumer not found "${consumerId}"`)
    await acl(c, consumer, { label: 'Consumer' })

    return c.json(parseZodSchema(schema.consumerSelectSchema, consumer))
  })
}
