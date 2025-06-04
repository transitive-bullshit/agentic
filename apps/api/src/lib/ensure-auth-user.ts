import { assert } from '@agentic/platform-core'

import type { AuthenticatedHonoContext } from '@/lib/types'
import { db, eq, type RawUser, schema } from '@/db'

export async function ensureAuthUser(
  ctx: AuthenticatedHonoContext
): Promise<RawUser> {
  let user = ctx.get('user')
  if (user) return user

  const userId = ctx.get('userId')
  assert(userId, 401, 'Unauthorized')

  user = await db.query.users.findFirst({
    where: eq(schema.users.id, userId)
  })
  assert(user, 401, 'Unauthorized')
  ctx.set('user', user)

  return user
}
