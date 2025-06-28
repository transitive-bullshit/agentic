import { assert } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { parseConsumerSelectSchema } from '@/db/schema'
import { acl } from '@/lib/acl'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { consumerIdParamsSchema, populateConsumerSchema } from './schemas'

const route = createRoute({
  description: 'Gets a consumer by ID.',
  tags: ['consumers'],
  operationId: 'getConsumer',
  method: 'get',
  path: 'consumers/{consumerId}',
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

export function registerV1GetConsumer(app: OpenAPIHono<AuthenticatedHonoEnv>) {
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

    return c.json(parseConsumerSelectSchema(consumer))
  })
}
