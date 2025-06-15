import type { OpenAPIHono } from '@hono/zod-openapi'
import { assert } from '@agentic/platform-core'

export function registerV1OAuthRedirect(app: OpenAPIHono) {
  return app.all('oauth', async (ctx) => {
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

      ctx.redirect(`${uri}?${searchParams.toString()}`)
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
      ctx.redirect(`${uri}?${searchParams.toString()}`)
    }
  })
}
