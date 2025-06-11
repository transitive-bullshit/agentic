import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

const route = createRoute({
  description: 'Custom cache control tool',
  operationId: 'customCacheControlTool',
  method: 'post',
  path: '/custom-cache-control-tool',
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

export function registerCustomCacheControlTool(app: OpenAPIHono) {
  return app.openapi(route, async (c) => {
    return c.json(c.req.valid('json'))
  })
}
