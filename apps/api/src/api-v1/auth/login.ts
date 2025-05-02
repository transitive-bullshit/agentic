import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

import { env } from '@/lib/env'
import { workos } from '@/lib/workos'

const route = createRoute({
  method: 'get',
  path: 'auth/login',
  hide: true,
  request: {
    query: z.object({
      redirectUri: z.string().url().optional()
    })
  },
  responses: {
    302: {
      description: 'Redirect to WorkOS login page'
    }
  }
})

export function registerAuthLogin(app: OpenAPIHono) {
  return app.openapi(route, async (c) => {
    const { redirectUri = 'http://localhost:3000/auth/callback' } =
      c.req.valid('query')

    const authorizationUrl = workos.userManagement.getAuthorizationUrl({
      clientId: env.WORKOS_CLIENT_ID,

      // Specify that we'd like AuthKit to handle the authentication flow
      provider: 'authkit',

      // The callback endpoint that WorkOS will redirect to after a user authenticates
      redirectUri
    })

    return c.redirect(authorizationUrl)
  })
}
