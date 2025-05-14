import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { aclAdmin } from '@/lib/acl-admin'
import {
  assert,
  openapiErrorResponse404,
  openapiErrorResponses,
  parseZodSchema
} from '@/lib/utils'

import { consumerTokenParamsSchema, populateConsumerSchema } from './schemas'

const route = createRoute({
  description: 'Gets a consumer',
  tags: ['consumers'],
  operationId: 'getConsumer',
  method: 'get',
  path: 'admin/consumers/tokens/{token}',
  security: [{ bearerAuth: [] }],
  request: {
    params: consumerTokenParamsSchema,
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

export function registerV1AdminConsumersGetConsumerByToken(
  app: OpenAPIHono<AuthenticatedEnv>
) {
  return app.openapi(route, async (c) => {
    const { token } = c.req.valid('param')
    const { populate = [] } = c.req.valid('query')
    await aclAdmin(c)

    const consumer = await db.query.consumers.findFirst({
      where: eq(schema.consumers.token, token),
      with: {
        ...Object.fromEntries(populate.map((field) => [field, true]))
      }
    })
    assert(consumer, 404, `Consumer token not found "${token}"`)

    return c.json(parseZodSchema(schema.consumerSelectSchema, consumer))
  })
}
