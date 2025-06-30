import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

const route = createRoute({
  description: 'Disabled for free plan tool',
  operationId: 'disabledForFreePlanTool',
  method: 'get',
  path: '/disabled-for-free-plan-tool',
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

export function registerDisabledForFreePlanTool(app: OpenAPIHono) {
  return app.openapi(route, async (c) => {
    return c.json({ status: 'ok' })
  })
}
