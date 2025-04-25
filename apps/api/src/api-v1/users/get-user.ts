import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, eq, schema, userIdSchema } from '@/db'
import { assert, parseZodSchema } from '@/lib/utils'

const ParamsSchema = z.object({
  userId: userIdSchema.openapi({
    param: {
      name: 'userId',
      in: 'path'
    },
    example: 'pfh0haxfpzowht3oi213cqos'
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

export type Route = typeof route
export type V1UsersGetUserResponse = z.infer<
  (typeof route.responses)[200]['content']['application/json']['schema']
>

export const registerV1UsersGetUser = (app: OpenAPIHono<AuthenticatedEnv>) =>
  app.openapi(route, async (c) => {
    const { userId } = c.req.valid('param')

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId)
    })
    assert(user, 404, `User not found: ${userId}`)

    return c.json(parseZodSchema(schema.userSelectSchema, user))
  })
