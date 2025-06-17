import type { DefaultHonoEnv } from '@agentic/platform-hono'
import type { OpenAPIHono } from '@hono/zod-openapi'
import { assert } from '@agentic/platform-core'

export function registerOAuthRedirect(app: OpenAPIHono<DefaultHonoEnv>) {
  return app.all('/oauth/callback', async (ctx) => {
    const logger = ctx.get('logger')

    if (ctx.req.query('state')) {
      const { state: state64, ...query } = ctx.req.query()

      // google oauth + others
      const { uri, ...state } = JSON.parse(
        Buffer.from(state64!, 'base64').toString()
      ) as any

      assert(
        uri,
        404,
        `Error oauth redirect not found "${new URLSearchParams(ctx.req.query()).toString()}"`
      )

      const searchParams = new URLSearchParams({
        ...state,
        ...query
      })
      const redirectUri = `${uri}?${searchParams.toString()}`

      logger.info(
        'OAUTH CALLBACK',
        ctx.req.method,
        ctx.req.url,
        ctx.req.query(),
        '=>',
        redirectUri
      )
      return ctx.redirect(redirectUri)
    } else {
      // github oauth
      // https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/#redirect-urls
      const { uri, ...params } = ctx.req.query()

      assert(
        uri,
        404,
        `Error oauth redirect not found "${new URLSearchParams(ctx.req.query()).toString()}"`
      )

      const searchParams = new URLSearchParams(params)
      const redirectUri = `${uri}?${searchParams.toString()}`
      logger.info(
        'OAUTH CALLBACK',
        ctx.req.method,
        ctx.req.url,
        ctx.req.query(),
        '=>',
        redirectUri
      )

      return ctx.redirect(redirectUri)
    }
  })
}
