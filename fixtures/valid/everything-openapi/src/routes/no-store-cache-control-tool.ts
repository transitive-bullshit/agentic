import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

const route = createRoute({
  description: 'No store cache control tool',
  operationId: 'noStoreCacheControlTool',
  method: 'post',
  path: '/no-store-cache-control-tool',
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

export function registerNoStoreCacheControlTool(app: OpenAPIHono) {
  return app.openapi(route, async (c) => {
    return c.json(c.req.valid('json'))
  })
}
