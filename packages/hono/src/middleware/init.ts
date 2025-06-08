import { assert } from '@agentic/platform-core'
import { EventId } from 'eventid'
import { createMiddleware } from 'hono/factory'

import type { DefaultHonoEnv } from '../types'
import { ConsoleLogger } from '../logger'

// Monotonically increasing request IDs for logging / tracing.
let eventIdGenerator: EventId | undefined

export const init = createMiddleware<DefaultHonoEnv>(
  async function initMiddleware(ctx, next) {
    assert(ctx.env, 'env is required')

    if (!eventIdGenerator) {
      eventIdGenerator = new EventId()
    }

    const requestId = eventIdGenerator.new()
    ctx.set('requestId', requestId)
    ctx.res.headers.set('X-Request-Id', requestId)

    const logger = new ConsoleLogger(ctx.env, { requestId })
    ctx.set('logger', logger)

    ctx.set('isJsonRpcRequest', false)

    const ip =
      ctx.req.header('cf-connecting-ip') || ctx.req.header('x-forwarded-for')
    ctx.set('ip', ip)

    await next()
  }
)
