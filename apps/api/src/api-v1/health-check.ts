import { createRoute, z } from '@hono/zod-openapi'

import type { HonoApp } from '@/lib/types'

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

export function registerHealthCheck(app: HonoApp) {
  return app.openapi(route, async (c) => {
    return c.json({ status: 'ok' })
  })
}
