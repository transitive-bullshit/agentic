import { createMiddleware } from 'hono/factory'
import { logger as honoLogger } from 'hono/logger'

import type { DefaultHonoEnv } from '../types'
import { unless } from './unless'

export const accessLogger = unless(
  createMiddleware<DefaultHonoEnv>(async (ctx, next) => {
    const logger = ctx.get('logger')
    const { isProd } = ctx.env

    const logMethod = isProd
      ? logger.trace.bind(logger)
      : logger.info.bind(logger)

    await honoLogger(logMethod)(ctx, next)
  }),
  // Ignore health check route
  '/v1/health',
  // Ignore openauth routes
  '/authorize',
  '/userinfo',
  '/token',
  '/.well-known/jwks.json',
  '/.well-known/oauth-authorization-server'
)
