import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { aclAdmin } from '@/lib/acl-admin'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { consumerApiKeyParamsSchema, populateConsumerSchema } from './schemas'
import { setAdminCacheControlForConsumer } from './utils'

const route = createRoute({
  description: 'Gets a consumer by API key. This route is admin-only.',
  tags: ['admin', 'consumers'],
  operationId: 'adminGetConsumerByApiKey',
  method: 'get',
  // TODO: is it wise to use a path param for the API key? especially wehn it'll
  // be cached in cloudflare's shared cache?
  path: 'admin/consumers/api-keys/{apiKey}',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    params: consumerApiKeyParamsSchema,
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

export function registerV1AdminGetConsumerByApiKey(
  app: OpenAPIHono<AuthenticatedHonoEnv>
) {
  return app.openapi(route, async (c) => {
    const { apiKey } = c.req.valid('param')
    const { populate = [] } = c.req.valid('query')
    await aclAdmin(c)

    const consumer = await db.query.consumers.findFirst({
      where: eq(schema.consumers.token, apiKey),
      with: {
        ...Object.fromEntries(populate.map((field) => [field, true]))
      }
    })
    assert(consumer, 404, `API key not found "${apiKey}"`)

    setAdminCacheControlForConsumer(c, consumer)
    return c.json(parseZodSchema(schema.consumerAdminSelectSchema, consumer))
  })
}
