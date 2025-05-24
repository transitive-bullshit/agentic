import { assert } from '@agentic/platform-core'
import { createMiddleware } from 'hono/factory'

import type { AuthenticatedEnv } from '@/lib/types'
import { authClient } from '@/lib/auth/client'
import { subjects } from '@/lib/auth/subjects'

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

    const verified = await authClient.verify(subjects, token)
    assert(!verified.err, 401, 'Unauthorized')

    const userId = verified.subject.properties.id
    assert(userId, 401, 'Unauthorized')
    ctx.set('userId', userId)

    await next()
  }
)
