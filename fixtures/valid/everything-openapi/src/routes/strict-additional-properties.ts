import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

const route = createRoute({
  description: 'Echoes the request body only allowing a single "foo" field.',
  operationId: 'strictAdditionalProperties',
  method: 'post',
  path: '/strict-additional-properties',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            foo: z.string()
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Echoed request body',
      content: {
        'application/json': {
          schema: z.object({
            foo: z.string()
          })
        }
      }
    }
  }
})

export function registerStrictAdditionalProperties(app: OpenAPIHono) {
  return app.openapi(route, async (c) => {
    return c.json(c.req.valid('json'))
  })
}
