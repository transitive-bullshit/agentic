import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

const route = createRoute({
  description: 'Echoes the request body',
  operationId: 'echo',
  method: 'post',
  path: '/echo',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({}).passthrough()
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Echoed request body',
      content: {
        'application/json': {
          schema: z.object({}).passthrough()
        }
      }
    }
  }
})

export function registerEcho(app: OpenAPIHono) {
  return app.openapi(route, async (c) => {
    return c.json(c.req.valid('json'))
  })
}
