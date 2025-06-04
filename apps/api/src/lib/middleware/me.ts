import { createMiddleware } from 'hono/factory'

import type { AuthenticatedHonoEnv } from '@/lib/types'

import { ensureAuthUser } from '../ensure-auth-user'

export const me = createMiddleware<AuthenticatedHonoEnv>(
  async function meMiddleware(ctx, next) {
    const regex = /^\/(me)(\/|$)/

    if (regex.test(ctx.req.path)) {
      const user = await ensureAuthUser(ctx)

      if (user) {
        // TODO: redirect instead?
        ctx.req.path = ctx.req.path.replace(regex, `/users/${user.id}$2`)
      }
    }

    await next()
  }
)
