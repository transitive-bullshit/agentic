import type { DefaultHonoEnv } from '@agentic/platform-hono'
import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

import { env } from '@/lib/env'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { authStorage } from './utils'

const route = createRoute({
  description: 'Starts a GitHub OAuth flow.',
  tags: ['auth'],
  operationId: 'initGitHubOAuthFlow',
  method: 'get',
  path: 'auth/github/init',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    query: z
      .object({
        redirect_uri: z.string(),
        client_id: z.string().optional(),
        scope: z.string().optional()
      })
      .passthrough()
  },
  responses: {
    302: {
      description: 'Redirected to GitHub'
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

export function registerV1GitHubOAuthInitFlow(
  app: OpenAPIHono<DefaultHonoEnv>
) {
  return app.openapi(route, async (c) => {
    const logger = c.get('logger')
    const {
      client_id: clientId = env.GITHUB_CLIENT_ID,
      scope = 'user:email',
      redirect_uri: redirectUri
    } = c.req.query()

    const state = crypto.randomUUID()

    // TODO: unique identifier
    await authStorage.set(['github', state, 'redirectUri'], { redirectUri })

    const publicRedirectUri = `${env.apiBaseUrl}/v1/auth/github/callback`

    const url = new URL('https://github.com/login/oauth/authorize')
    url.searchParams.append('client_id', clientId)
    url.searchParams.append('scope', scope)
    url.searchParams.append('state', state)
    url.searchParams.append('redirect_uri', publicRedirectUri)

    logger.info('Redirecting to GitHub', {
      url: url.toString(),
      clientId,
      scope,
      publicRedirectUri
    })

    return c.redirect(url.toString())
  })
}
