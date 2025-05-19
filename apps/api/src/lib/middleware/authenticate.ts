import { assert } from '@agentic/platform-core'
import { createMiddleware } from 'hono/factory'
import * as jwt from 'hono/jwt'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, eq, schema } from '@/db'
import { env } from '@/lib/env'

export const authenticate = createMiddleware<AuthenticatedEnv>(
  async function authenticateMiddleware(ctx, next) {
    const credentials = ctx.req.raw.headers.get('Authorization')
    assert(credentials, 401, 'Unauthorized')

    const parts = credentials.split(/\s+/)
    assert(
      parts.length === 1 ||
        (parts.length === 2 && parts[0]?.toLowerCase() === 'bearer'),
      401,
      'Unauthorized'
    )
    const token = parts.at(-1)
    assert(token, 401, 'Unauthorized')

    const payload = await jwt.verify(token, env.JWT_SECRET)
    assert(payload, 401, 'Unauthorized')
    assert(payload.type === 'user', 401, 'Unauthorized')
    assert(
      payload.userId && typeof payload.userId === 'string',
      401,
      'Unauthorized'
    )
    ctx.set('userId', payload.userId)

    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, payload.userId)
    })
    assert(user, 401, 'Unauthorized')
    ctx.set('user', user as any)

    await next()
  }
)
