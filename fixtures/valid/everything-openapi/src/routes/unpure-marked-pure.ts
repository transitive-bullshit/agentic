import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

const route = createRoute({
  description: 'Unpure tool marked pure',
  operationId: 'unpure_marked_pure',
  method: 'post',
  path: '/unpure-marked-pure',
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
      description: 'Echoed request body with current timestamp to not be pure',
      content: {
        'application/json': {
          schema: z
            .object({
              now: z.number()
            })
            .passthrough()
        }
      }
    }
  }
})

export function registerUnpureMarkedPure(app: OpenAPIHono) {
  return app.openapi(route, async (c) => {
    const now = Date.now()
    return c.json({
      now,
      ...c.req.valid('json')
    }) as any
  })
}
