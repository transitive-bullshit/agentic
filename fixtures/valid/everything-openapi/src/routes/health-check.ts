import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

const route = createRoute({
  description: 'Check if the server is healthy',
  operationId: 'healthCheck',
  method: 'get',
  path: '/health', // Hint: at GET /v1/health
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
