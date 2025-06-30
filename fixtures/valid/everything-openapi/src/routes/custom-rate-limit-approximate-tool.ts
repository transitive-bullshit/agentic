import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

const route = createRoute({
  description: 'Custom rate limit tool (approximate mode)',
  operationId: 'customRateLimitApproximateTool',
  method: 'post',
  path: '/custom-rate-limit-approximate-tool',
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

export function registerCustomRateLimitApproximateTool(app: OpenAPIHono) {
  return app.openapi(route, async (c) => {
    return c.json(c.req.valid('json'))
  })
}
