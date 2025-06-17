import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { aclAdmin } from '@/lib/acl-admin'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponse409,
  openapiErrorResponse410,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { consumerIdParamsSchema } from './schemas'
import { setAdminCacheControlForConsumer } from './utils'

const route = createRoute({
  description:
    "Activates a consumer signifying that at least one API call has been made using the consumer's API token. This method is idempotent and admin-only.",
  tags: ['admin', 'consumers'],
  operationId: 'adminActivateConsumer',
  method: 'put',
  path: 'admin/consumers/{consumerId}/activate',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    params: consumerIdParamsSchema
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
    ...openapiErrorResponse404,
    ...openapiErrorResponse409,
    ...openapiErrorResponse410
  }
})

export function registerV1AdminActivateConsumer(
  app: OpenAPIHono<AuthenticatedHonoEnv>
) {
  return app.openapi(route, async (c) => {
    const { consumerId } = c.req.valid('param')
    await aclAdmin(c)

    const [consumer] = await db
      .update(schema.consumers)
      .set({ activated: true })
      .where(eq(schema.consumers.id, consumerId))
      .returning()
    assert(consumer, 404, `Consumer not found "${consumerId}"`)

    setAdminCacheControlForConsumer(c, consumer)
    return c.json(parseZodSchema(schema.consumerAdminSelectSchema, consumer))
  })
}
