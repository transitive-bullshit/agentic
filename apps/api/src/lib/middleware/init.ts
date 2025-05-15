import { EventId } from 'eventid'
import { createMiddleware } from 'hono/factory'

import type { DefaultEnv } from '@/lib/types'

import { ConsoleLogger } from '../logger'

/** Monotonically increasing ID for insertId. */
const eventId = new EventId()

export const init = createMiddleware<DefaultEnv>(
  async function initMiddleware(ctx, next) {
    const requestId = eventId.new()
    ctx.set('requestId', requestId)
    ctx.res.headers.set('X-Request-Id', requestId)

    const logger = new ConsoleLogger({
      requestId,
      service: 'api'
    })
    ctx.set('logger', logger)

    await next()
  }
)
