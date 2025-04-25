import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

const route = createRoute({
  method: 'get',
  path: 'health',
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.object({
            status: z.string()
          })
        }
      }
    }
  }
})

export function registerHealthCheck(app: OpenAPIHono) {
  return app.openapi(route, async (c) => {
    return c.json({ status: 'ok' })
  })
}
