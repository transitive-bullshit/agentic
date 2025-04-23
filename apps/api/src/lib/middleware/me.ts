import { createMiddleware } from 'hono/factory'

import type { AuthenticatedEnv } from '@/lib/types'

export const me = createMiddleware<AuthenticatedEnv>(
  async function meMiddleware(ctx, next) {
    const user = ctx.get('user')
    const regex = /^\/(me)(\/|$)/

    if (user && regex.test(ctx.req.path)) {
      // TODO: redirect instead?
      ctx.req.path = ctx.req.path.replace(regex, `/users/${user.id}$2`)
    }

    await next()
  }
)
