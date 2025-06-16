import ky from 'ky'
import { Octokit } from 'octokit'

import { env } from '@/lib/env'

const USER_AGENT = 'agentic-platform'

/**
 * GitHub (user-level) OAuth token response.
 *
 * @see https://docs.github.com/apps/oauth
 */
export interface GitHubUserTokenResponse {
  /**
   * The user access token (always starts with `ghu_`).
   * Example: `ghu_xxx…`
   */
  access_token: string

  /**
   * Seconds until `access_token` expires.
   * Omitted (`undefined`) if you’ve disabled token expiration.
   * Constant `28800` (8 hours) when present.
   */
  expires_in?: number

  /**
   * Refresh token for renewing the user access token (starts with `ghr_`).
   * Omitted (`undefined`) if you’ve disabled token expiration.
   */
  refresh_token?: string

  /**
   * Seconds until `refresh_token` expires.
   * Omitted (`undefined`) if you’ve disabled token expiration.
   * Constant `15897600` (6 months) when present.
   */
  refresh_token_expires_in?: number

  /**
   * Scopes granted to the token.
   * Always an empty string because the token is limited to
   * the intersection of app-level and user-level permissions.
   */
  scope: ''

  /**
   * Token type – always `'bearer'`.
   */
  token_type: 'bearer'
}

export function getGitHubClient({
  accessToken
}: {
  accessToken: string
}): Octokit {
  return new Octokit({ auth: accessToken })
}

export async function exchangeGitHubOAuthCodeForAccessToken({
  code,
  clientId = env.GITHUB_CLIENT_ID,
  clientSecret = env.GITHUB_CLIENT_SECRET,
  redirectUri
}: {
  code: string
  clientId?: string
  clientSecret?: string
  redirectUri?: string
}): Promise<GitHubUserTokenResponse> {
  return ky
    .post('https://github.com/login/oauth/access_token', {
      json: {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
      },
      headers: {
        'user-agent': USER_AGENT
      }
    })
    .json<GitHubUserTokenResponse>()
}
