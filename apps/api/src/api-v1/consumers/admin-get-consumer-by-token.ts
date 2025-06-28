import { assert } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { parseConsumerAdminSelectSchema } from '@/db/schema'
import { aclAdmin } from '@/lib/acl-admin'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { consumerTokenParamsSchema, populateConsumerSchema } from './schemas'
import { setAdminCacheControlForConsumer } from './utils'

const route = createRoute({
  description: 'Gets a consumer by API token. This route is admin-only.',
  tags: ['admin', 'consumers'],
  operationId: 'adminGetConsumerByToken',
  method: 'get',
  path: 'admin/consumers/tokens/{token}',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    params: consumerTokenParamsSchema,
    query: populateConsumerSchema
  },
  responses: {
    200: {
      description: 'An admin consumer object',
      content: {
        'application/json': {
          schema: schema.consumerAdminSelectSchema
        }
      }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

export function registerV1AdminGetConsumerByToken(
  app: OpenAPIHono<AuthenticatedHonoEnv>
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
    assert(consumer, 404, `API token not found "${token}"`)

    setAdminCacheControlForConsumer(c, consumer)
    return c.json(parseConsumerAdminSelectSchema(consumer))
  })
}
