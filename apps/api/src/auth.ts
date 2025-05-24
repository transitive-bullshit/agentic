import { assert, pick } from '@agentic/platform-core'
import { issuer } from '@openauthjs/openauth'
import { GithubProvider } from '@openauthjs/openauth/provider/github'
import { PasswordProvider } from '@openauthjs/openauth/provider/password'
import { PasswordUI } from '@openauthjs/openauth/ui/password'

import { type RawUser } from '@/db'
import { subjects } from '@/lib/auth/subjects'
import { upsertOrLinkUserAccount } from '@/lib/auth/upsert-or-link-user-account'
import { DrizzleAuthStorage } from '@/lib/drizzle-auth-storage'
import { env } from '@/lib/env'
import { getGitHubClient } from '@/lib/external/github'

// Initialize OpenAuth issuer which is a Hono app for all auth routes.
export const authRouter = issuer({
  subjects,
  storage: DrizzleAuthStorage(),
  providers: {
    github: GithubProvider({
      clientID: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      scopes: ['user:email']
    }),
    password: PasswordProvider(
      PasswordUI({
        sendCode: async (email, code) => {
          // TODO: Send email code to user
          // eslint-disable-next-line no-console
          console.log({ email, code })
        }
      })
    )
  },
  success: async (ctx, value) => {
    const { provider } = value
    let user: RawUser | undefined

    // eslint-disable-next-line no-console
    console.log('Auth success', provider, ctx, JSON.stringify(value, null, 2))

    function getPartialOAuthAccount() {
      assert(provider === 'github', `Unsupported provider "${provider}"`)

      return {
        provider,
        accessToken: value.tokenset.access,
        refreshToken: value.tokenset.refresh,
        // `expires_in` and `refresh_token_expires_in` are given in seconds
        accessTokenExpiresAt: new Date(
          Date.now() + value.tokenset.raw.expires_in * 1000
        ),
        refreshTokenExpiresAt: new Date(
          Date.now() + value.tokenset.raw.refresh_token_expires_in * 1000
        ),
        scope: (value.tokenset.raw.scope as string) || undefined
      }
    }

    if (provider === 'github') {
      const client = getGitHubClient({
        accessToken: value.tokenset.access
      })
      const { data: ghUser } = await client.rest.users.getAuthenticated()

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

      user = await upsertOrLinkUserAccount({
        partialAccount: {
          accountId: `${ghUser.id}`,
          accountUsername: ghUser.login.toLowerCase(),
          ...getPartialOAuthAccount()
        },
        partialUser: {
          email: ghUser.email,
          emailVerified: true,
          name: ghUser.name || undefined,
          username: ghUser.login.toLowerCase(),
          image: ghUser.avatar_url
        }
      })
    } else if (provider === 'password') {
      user = await upsertOrLinkUserAccount({
        partialAccount: {
          provider,
          accountId: value.email
        },
        partialUser: {
          email: value.email,
          emailVerified: true
        }
      })
    } else {
      assert(
        user,
        404,
        `Authentication error: unsupported provider "${provider}"`
      )
    }

    assert(
      user,
      404,
      `Authentication error for provider "${provider}": User not found`
    )
    return ctx.subject('user', pick(user, 'id'))
  }
})
