import { createMiddleware } from 'hono/factory'

import type { DefaultHonoEnv } from '../types'

export const responseTime = createMiddleware<DefaultHonoEnv>(
  async function responseTimeMiddleware(ctx, next) {
    const start = Date.now()
    await next()

    if (!ctx.finalized) {
      const duration = Date.now() - start
      ctx.res.headers.set('x-response-time', `${duration}ms`)
    }
  }
)
