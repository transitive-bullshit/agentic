import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

const route = createRoute({
  description: 'Disabled tool',
  operationId: 'disabledTool',
  method: 'get',
  path: '/disabled-tool',
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

export function registerDisabledTool(app: OpenAPIHono) {
  return app.openapi(route, async (c) => {
    return c.json({ status: 'ok' })
  })
}
