import { assert, getEnv } from '@agentic/core'
import { auth, Client as TwitterV2Client } from 'twitter-api-sdk'

import { getNango, validateNangoConnectionOAuthScopes } from './nango'

// Auth new Nango accounts here: https://app.nango.dev/connections

// The Twitter OAuth2User class requires a client id, which we don't have
// since we're using Nango for auth, so instead we just pass a dummy value
// and allow Nango to handle all auth/refresh/access token management.
const dummyTwitterClientId = 'agentic'

export const defaultTwitterOAuthScopes = [
  'tweet.read',
  'users.read',
  'offline.access',
  'tweet.write'
]

async function createTwitterAuth({
  scopes,
  nangoConnectionId,
  nangoCallbackUrl,
  nangoProviderConfigKey
}: {
  scopes: string[]
  nangoConnectionId: string
  nangoCallbackUrl: string
  nangoProviderConfigKey: string
}): Promise<auth.OAuth2User> {
  const nango = getNango()
  const connection = await nango.getConnection(
    nangoProviderConfigKey,
    nangoConnectionId
  )

  validateNangoConnectionOAuthScopes({
    connection,
    scopes
  })

  const token = connection.credentials.raw
  assert(token)

  return new auth.OAuth2User({
    client_id: dummyTwitterClientId,
    callback: nangoCallbackUrl,
    scopes: scopes as any[],
    token
  })
}

export async function createTwitterV2Client({
  scopes = defaultTwitterOAuthScopes,
  nangoConnectionId = getEnv('NANGO_CONNECTION_ID'),
  nangoCallbackUrl = getEnv('NANGO_CALLBACK_URL') ??
    'https://api.nango.dev/oauth/callback',
  nangoProviderConfigKey = 'twitter-v2'
}: {
  scopes?: string[]
  nangoConnectionId?: string
  nangoCallbackUrl?: string
  nangoProviderConfigKey?: string
} = {}): Promise<TwitterV2Client> {
  assert(nangoConnectionId, 'twitter client missing nangoConnectionId')
  assert(nangoCallbackUrl, 'twitter client missing nangoCallbackUrl')

  // NOTE: Nango handles refreshing the oauth access token for us
  const twitterAuth = await createTwitterAuth({
    scopes,
    nangoConnectionId,
    nangoCallbackUrl,
    nangoProviderConfigKey
  })

  // Twitter API v2 using OAuth 2.0
  return new TwitterV2Client(twitterAuth)
}
