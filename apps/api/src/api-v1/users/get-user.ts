import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { acl } from '@/lib/acl'
import { setPublicCacheControl } from '@/lib/cache-control'
import { env } from '@/lib/env'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { userIdParamsSchema } from './schemas'

const route = createRoute({
  description: 'Gets a user by ID.',
  tags: ['users'],
  operationId: 'getUser',
  method: 'get',
  path: 'users/{userId}',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    params: userIdParamsSchema
  },
  responses: {
    200: {
      description: 'A user object',
      content: {
        'application/json': {
          schema: schema.userSelectSchema
        }
      }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

export function registerV1GetUser(app: OpenAPIHono<AuthenticatedHonoEnv>) {
  return app.openapi(route, async (c) => {
    const { userId } = c.req.valid('param')
    await acl(c, { userId }, { label: 'User' })

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId)
    })
    assert(user, 404, `User not found "${userId}"`)
    setPublicCacheControl(c.res, env.isProd ? '30s' : '10s')

    return c.json(parseZodSchema(schema.userSelectSchema, user))
  })
}
