import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'
import { setCookie } from 'hono/cookie'

import { env } from '@/lib/env'
import { assert } from '@/lib/utils'
import { workos } from '@/lib/workos'

const route = createRoute({
  method: 'get',
  path: 'auth/callback',
  hide: true,
  request: {
    query: z.object({
      code: z.string()
    })
  },
  responses: {
    302: {
      description: 'Redirect'
    }
  }
})

export function registerAuthCallback(app: OpenAPIHono) {
  return app.openapi(route, async (c) => {
    const { code } = c.req.valid('query')
    assert(code, 400, '"code" is required')

    try {
      const authenticateResponse =
        await workos.userManagement.authenticateWithCode({
          clientId: env.WORKOS_CLIENT_ID,
          code,
          session: {
            sealSession: true,
            cookiePassword: env.WORKOS_SESSION_SECRET
          }
        })

      const { user: _user, sealedSession } = authenticateResponse
      assert(sealedSession, 500, 'Sealed session is required')

      // Store session in a cookie
      setCookie(c, 'wos-session', sealedSession!, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      })

      // TODO: `user`

      // Redirect the user to the homepage
      return c.redirect('/')
    } catch {
      return c.redirect('/auth/login')
    }
  })
}
