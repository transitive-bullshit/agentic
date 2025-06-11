import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

const route = createRoute({
  description: 'Gets a user',
  tags: ['users'],
  operationId: 'getUser',
  method: 'get',
  path: '/users/{userId}',
  request: {
    params: z.object({
      userId: z.string().openapi({
        param: {
          description: 'User ID',
          name: 'userId',
          in: 'path'
        }
      })
    })
  },
  responses: {
    200: {
      description: 'A user object',
      content: {
        'application/json': {
          schema: z
            .object({
              id: z.string(),
              name: z.string(),
              email: z.string()
            })
            .openapi('User')
        }
      }
    }
  }
})

export function registerGetUser(app: OpenAPIHono) {
  return app.openapi(route, async (c) => {
    const { userId } = c.req.valid('param')

    return c.json({
      id: userId,
      name: 'John Doe',
      email: 'john.doe@example.com'
    })
  })
}
