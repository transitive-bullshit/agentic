import { createMiddleware } from 'hono/factory'
import { logger as honoLogger } from 'hono/logger'

import type { DefaultEnv } from '@/lib/types'

import { unless } from './unless'

export const accessLogger = unless(
  createMiddleware<DefaultEnv>(async (ctx, next) => {
    const logger = ctx.get('logger')
    await honoLogger(logger.trace.bind(logger))(ctx, next)
  }),
  '/v1/health'
)
