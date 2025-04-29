import type { AuthenticatedContext } from './types'
import { assert } from './utils'

export async function aclAdmin(ctx: AuthenticatedContext) {
  const user = ctx.get('user')
  assert(user, 401, 'Authentication required')
  assert(user.role === 'admin', 403, 'Access denied')
}
