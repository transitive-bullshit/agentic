import type { DefaultHonoEnv } from '@agentic/platform-hono'
import { assert, parseZodSchema } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

import { createAuthToken } from '@/lib/auth/create-auth-token'
import { upsertOrLinkUserAccount } from '@/lib/auth/upsert-or-link-user-account'
import {
  exchangeGitHubOAuthCodeForAccessToken,
  getGitHubClient
} from '@/lib/external/github'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { authSessionResponseSchema } from './schemas'

const route = createRoute({
  description: 'Exchanges a GitHub OAuth code for an Agentic auth session.',
  tags: ['auth'],
  operationId: 'exchangeOAuthCodeWithGitHub',
  method: 'post',
  path: 'auth/github',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z
            .object({
              code: z.string()
            })
            .passthrough()
        }
      }
    }
  },
  responses: {
    200: {
      description: 'An auth session',
      content: {
        'application/json': {
          schema: authSessionResponseSchema
        }
      }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

export function registerV1AuthExchangeOAuthCodeWithGitHub(
  app: OpenAPIHono<DefaultHonoEnv>
) {
  return app.openapi(route, async (c) => {
    const logger = c.get('logger')
    const body = c.req.valid('json')

    const result = await exchangeGitHubOAuthCodeForAccessToken(body)
    logger.info('github oauth', result)

    const client = getGitHubClient({ accessToken: result.access_token! })
    const { data: ghUser } = await client.rest.users.getAuthenticated()

    logger.info('github user', ghUser)

    if (!ghUser.email) {
      const { data: emails } = await client.request('GET /user/emails')
      const primary = emails.find((e) => e.primary)
      const verified = emails.find((e) => e.verified)
      const fallback = emails.find((e) => e.email)
      const email = primary?.email || verified?.email || fallback?.email
      ghUser.email = email!
    }

    assert(
      ghUser.email,
      'Error authenticating with GitHub: user email is required.'
    )

    const now = Date.now()
    const user = await upsertOrLinkUserAccount({
      partialAccount: {
        provider: 'github',
        accountId: `${ghUser.id}`,
        accountUsername: ghUser.login.toLowerCase(),
        accessToken: result.access_token,
        refreshToken: result.refresh_token,
        // `expires_in` and `refresh_token_expires_in` are given in seconds
        accessTokenExpiresAt: result.expires_in
          ? new Date(now + result.expires_in * 1000)
          : undefined,
        refreshTokenExpiresAt: result.refresh_token_expires_in
          ? new Date(now + result.refresh_token_expires_in * 1000)
          : undefined,
        scope: result.scope || undefined
      },
      partialUser: {
        email: ghUser.email,
        isEmailVerified: true,
        name: ghUser.name || undefined,
        username: ghUser.login.toLowerCase(),
        image: ghUser.avatar_url
      }
    })

    logger.info('github user result', user)

    const token = await createAuthToken(user)
    return c.json(parseZodSchema(authSessionResponseSchema, { token, user }))
  })
}
