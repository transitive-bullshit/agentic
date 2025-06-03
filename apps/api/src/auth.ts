import { assert, pick } from '@agentic/platform-core'
import { validators } from '@agentic/platform-validators'
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
  ttl: {
    access: 60 * 60 * 24 * 30, // 30 days
    refresh: 60 * 60 * 24 * 365 // 1 year
    // Used for creating longer-lived testing tokens
    // access: 60 * 60 * 24 * 366, // 1 year
    // refresh: 60 * 60 * 24 * 365 * 5 // 5 years
  },
  providers: {
    github: GithubProvider({
      clientID: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      scopes: ['user:email']
    }),
    password: PasswordProvider(
      PasswordUI({
        copy: {
          register_title: 'Welcome to Agentic',
          login_title: 'Welcome to Agentic'
        },
        sendCode: async (email, code) => {
          // TODO: Send email code to user
          // eslint-disable-next-line no-console
          console.log({ email, code })
        },
        validatePassword: (password) => {
          if (password.length < 3) {
            return 'Password must be at least 3 characters'
          }

          if (password.length > 1024) {
            return 'Password must be less than 1024 characters'
          }

          if (!validators.password(password)) {
            return 'Invalid password'
          }

          return undefined
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
      assert(provider === 'github', `Unsupported OAuth provider "${provider}"`)
      const now = Date.now()

      return {
        provider,
        accessToken: value.tokenset.access,
        refreshToken: value.tokenset.refresh,
        // `expires_in` and `refresh_token_expires_in` are given in seconds
        accessTokenExpiresAt: new Date(
          now + value.tokenset.raw.expires_in * 1000
        ),
        refreshTokenExpiresAt: new Date(
          now + value.tokenset.raw.refresh_token_expires_in * 1000
        ),
        scope: (value.tokenset.raw.scope as string) || undefined
      }
    }

    if (provider === 'github') {
      const client = getGitHubClient({ accessToken: value.tokenset.access })
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
          isEmailVerified: true,
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
          isEmailVerified: true
        }
      })
    } else {
      assert(
        user,
        400,
        `Authentication error: unsupported auth provider "${provider}"`
      )
    }

    assert(
      user,
      500,
      `Authentication error for auth provider "${provider}": Unexpected error initializing user`
    )
    return ctx.subject('user', pick(user, 'id', 'username'))
  }
})
