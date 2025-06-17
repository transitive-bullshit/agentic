import { assert } from '@agentic/platform-core'
import { authUserSchema } from '@agentic/platform-types'
import { createMiddleware } from 'hono/factory'
import { verify } from 'hono/jwt'

import type { RawUser } from '@/db'
import type { AuthenticatedHonoEnv } from '@/lib/types'
import { env } from '@/lib/env'
import { timingSafeCompare } from '@/lib/utils'

export const authenticate = createMiddleware<AuthenticatedHonoEnv>(
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

    // TODO: Use a more secure way to authenticate gateway admin requests.
    if (timingSafeCompare(token, env.AGENTIC_ADMIN_API_KEY)) {
      ctx.set('userId', 'admin')
      ctx.set('user', {
        id: 'admin',
        name: 'Admin',
        username: 'admin',
        role: 'admin',
        email: 'admin@agentic.so',
        isEmailVerified: true,
        image: undefined,
        stripeCustomerId: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: undefined
      } as RawUser)
    } else {
      const payload = await verify(token, env.JWT_SECRET)
      assert(payload, 401, 'Unauthorized')

      const parsedAuthUser = authUserSchema.safeParse(payload)
      assert(parsedAuthUser.success, 401, 'Unauthorized')
      ctx.set('userId', parsedAuthUser.data.id)
    }

    await next()
  }
)
