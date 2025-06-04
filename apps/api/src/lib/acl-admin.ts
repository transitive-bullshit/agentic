import { assert } from '@agentic/platform-core'

import type { AuthenticatedHonoContext } from './types'
import { ensureAuthUser } from './ensure-auth-user'

export async function aclAdmin(ctx: AuthenticatedHonoContext) {
  const user = await ensureAuthUser(ctx)
  assert(user, 401, 'Authentication required')
  assert(user.role === 'admin', 403, 'Access denied')
}
