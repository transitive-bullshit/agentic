import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, eq, schema, userIdSchema } from '@/db'
import { acl } from '@/lib/acl'
import { assert, parseZodSchema } from '@/lib/utils'

const ParamsSchema = z.object({
  userId: userIdSchema.openapi({
    param: {
      name: 'userId',
      in: 'path'
    }
  })
})

const route = createRoute({
  tags: ['users'],
  operationId: 'getUser',
  method: 'get',
  path: 'users/{userId}',
  security: [{ bearerAuth: [] }],
  request: {
    params: ParamsSchema
  },
  responses: {
    200: {
      description: 'A user object',
      content: {
        'application/json': {
          schema: schema.userSelectSchema
        }
      }
    }
    // TODO
    // ...openApiErrorResponses
  }
})

export function registerV1UsersGetUser(app: OpenAPIHono<AuthenticatedEnv>) {
  return app.openapi(route, async (c) => {
    const { userId } = c.req.valid('param')

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId)
    })
    assert(user, 404, `User not found "${userId}"`)
    acl(c, user, { label: 'User', userField: 'id' })

    return c.json(parseZodSchema(schema.userSelectSchema, user))
  })
}
