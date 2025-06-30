import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

const route = createRoute({
  description: 'Echoes the request headers',
  operationId: 'echoHeaders',
  method: 'get',
  path: '/echo-headers',
  responses: {
    200: {
      description: 'Echoed request headers',
      content: {
        'application/json': {
          schema: z.object({}).passthrough()
        }
      }
    }
  }
})

export function registerEchoHeaders(app: OpenAPIHono) {
  return app.openapi(route, async (c) => {
    const headers = c.req.header()
    return c.json(headers) as any
  })
}
