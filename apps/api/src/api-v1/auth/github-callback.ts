import type { DefaultHonoEnv } from '@agentic/platform-hono'
import type { OpenAPIHono } from '@hono/zod-openapi'
import { assert } from '@agentic/platform-core'

import { authStorage } from './utils'

export function registerV1GitHubOAuthCallback(
  app: OpenAPIHono<DefaultHonoEnv>
) {
  return app.get('auth/github/callback', async (c) => {
    const logger = c.get('logger')
    const query = c.req.query()

    assert(query.state, 400, 'State is required')

    const entry = await authStorage.get(['github', query.state, 'redirectUri'])
    assert(entry, 400, 'Redirect URI not found')
    const redirectUri = entry.redirectUri
    assert(entry.redirectUri, 400, 'Redirect URI not found')

    const url = new URL(redirectUri)
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value)
    }

    logger.info('GitHub auth callback', query, '=>', url.toString(), {
      rawUrl: redirectUri,
      query
    })
    return c.redirect(url.toString())
  })
}
