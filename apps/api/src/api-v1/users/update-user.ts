import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { acl } from '@/lib/acl'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { userIdParamsSchema } from './schemas'

const route = createRoute({
  description: 'Updates a user',
  tags: ['users'],
  operationId: 'updateUser',
  method: 'post',
  path: 'users/{userId}',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    params: userIdParamsSchema,
    body: {
      required: true,
      content: {
        'application/json': {
          schema: schema.userUpdateSchema
        }
      }
    }
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

export function registerV1UsersUpdateUser(app: OpenAPIHono<AuthenticatedEnv>) {
  return app.openapi(route, async (c) => {
    const { userId } = c.req.valid('param')
    await acl(c, { userId }, { label: 'User' })
    const body = c.req.valid('json')

    const [user] = await db
      .update(schema.users)
      .set(body)
      .where(eq(schema.users.id, userId))
      .returning()
    assert(user, 404, `User not found "${userId}"`)

    return c.json(parseZodSchema(schema.userSelectSchema, user))
  })
}
