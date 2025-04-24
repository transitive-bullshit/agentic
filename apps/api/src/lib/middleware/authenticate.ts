import { eq } from 'drizzle-orm'
import { createMiddleware } from 'hono/factory'
import { jwt } from 'hono/jwt'

import type { AuthenticatedEnv } from '@/lib/types'
import { db, schema } from '@/db'
import { env } from '@/lib/env'

import { assert } from '../utils'

const jwtMiddleware = jwt({
  secret: env.JWT_SECRET
})

export const authenticate = createMiddleware<AuthenticatedEnv>(
  async function authenticateMiddleware(ctx, next) {
    await jwtMiddleware(ctx, async () => {
      const payload = ctx.get('jwtPayload')
      assert(payload, 401, 'Unauthorized')
      assert(payload.type === 'user', 401, 'Unauthorized')

      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, payload.userId)
      })
      assert(user, 401, 'Unauthorized')
      ctx.set('user', user)

      await next()
    })
  }
)
