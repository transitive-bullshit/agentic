import { Nango } from '@nangohq/node'
import { auth, Client as TwitterClient } from 'twitter-api-sdk'

import * as config from '../config.js'
import { assert } from '../utils.js'

// The Twitter+Nango client auth connection key
const nangoTwitterProviderConfigKey = 'twitter-v2'

// The Twitter OAuth2User class requires a client id, which we don't have
// since we're using Nango for auth, so instead we just pass a dummy value
// and allow Nango to handle all auth/refresh/access token management.
const twitterClientId = 'xbot'

const defaultRequiredTwitterOAuthScopes = new Set<string>([
  'tweet.read',
  'users.read',
  'offline.access',
  'tweet.write'
])

let _nango: Nango | null = null

function getNango(): Nango {
  if (!_nango) {
    const secretKey = process.env.NANGO_SECRET_KEY?.trim()
    if (!secretKey) {
      throw new Error(`Missing required "NANGO_SECRET_KEY"`)
    }

    _nango = new Nango({ secretKey })
  }

  return _nango
}

async function getTwitterAuth({
  scopes = defaultRequiredTwitterOAuthScopes
}: { scopes?: Set<string> } = {}): Promise<auth.OAuth2User> {
  const nango = getNango()
  const connection = await nango.getConnection(
    nangoTwitterProviderConfigKey,
    config.nangoConnectionId
  )

  // console.debug('nango twitter connection', connection)
  // connection.credentials.raw
  // {
  //   token_type: 'bearer',
  //   expires_in: number,
  //   access_token: string
  //   scope: string
  //   expires_at: string
  // }
  const connectionScopes = new Set<string>(
    connection.credentials.raw.scope.split(' ')
  )
  const missingScopes = new Set<string>()

  for (const scope of scopes) {
    if (!connectionScopes.has(scope)) {
      missingScopes.add(scope)
    }
  }

  if (missingScopes.size > 0) {
    throw new Error(
      `Nango connection ${
        config.nangoConnectionId
      } is missing required OAuth scopes: ${[...missingScopes.values()].join(
        ', '
      )}`
    )
  }

  const token = connection.credentials.raw
  assert(token)

  return new auth.OAuth2User({
    client_id: twitterClientId,
    callback: config.nangoCallbackUrl,
    scopes: [...scopes.values()] as any,
    token
  })
}

export async function getTwitterClient({
  scopes = defaultRequiredTwitterOAuthScopes
}: { scopes?: Set<string> } = {}): Promise<TwitterClient> {
  // NOTE: Nango handles refreshing the oauth access token for us
  const twitterAuth = await getTwitterAuth({ scopes })

  // Twitter API v2 using OAuth 2.0
  return new TwitterClient(twitterAuth)
}
