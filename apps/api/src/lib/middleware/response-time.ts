import { createMiddleware } from 'hono/factory'

import type { AuthenticatedEnv } from '@/lib/types'

export const responseTime = createMiddleware<AuthenticatedEnv>(
  async function responseTimeMiddleware(ctx, next) {
    const start = Date.now()
    await next()
    const duration = Date.now() - start
    ctx.res.headers.set('X-Response-Time', `${duration}ms`)
  }
)
