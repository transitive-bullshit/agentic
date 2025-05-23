import type {
  AgenticApiClient,
  AuthSession
} from '@agentic/platform-api-client'
import { assert } from '@agentic/platform-core'
import { serve } from '@hono/node-server'
import getPort from 'get-port'
import { Hono } from 'hono'
import open from 'open'
import { oraPromise } from 'ora'

import { client } from './client'
import { AuthStore } from './store'

export async function authWithGitHub({
  preferredPort = 6013
}: {
  client: AgenticApiClient
  preferredPort?: number
}): Promise<AuthSession> {
  const port = await getPort({ port: preferredPort })
  const app = new Hono()

  if (port !== preferredPort) {
    throw new Error(
      `Port ${preferredPort} is required to authenticate with GitHub, but it is already in use.`
    )
  }

  let _resolveAuth: any
  let _rejectAuth: any

  const authP = new Promise<AuthSession>((resolve, reject) => {
    _resolveAuth = resolve
    _rejectAuth = reject
  })

  app.get('/callback/github/success', async (c) => {
    const cookie = c.req.header().cookie
    assert(cookie, 'Missing required auth cookie header')

    const session = await client.setAuthSession(cookie)
    assert(session, 'Failed to get auth session')

    AuthStore.setAuth({ cookie, session })
    _resolveAuth(session)

    return c.text(
      'Huzzah! You are now signed in to the Agentic CLI with GitHub.\n\nYou may close this browser tab. 😄'
    )
  })

  const server = serve({
    fetch: app.fetch,
    port
  })

  // TODO: clean these up
  process.on('SIGINT', () => {
    server.close()
    process.exit(0)
  })
  process.on('SIGTERM', () => {
    server.close((err) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      process.exit(0)
    })
  })

  const res = await client.authClient.signIn.social({
    provider: 'github',
    // TODO: add error url as well
    callbackURL: `http://localhost:${port}/callback/github/success`
  })
  assert(
    !res.error,
    ['Error signing in with GitHub', res.error?.code, res.error?.message]
      .filter(Boolean)
      .join(', ')
  )
  assert(res.data?.url, 'No URL returned from authClient.signIn.social')
  await open(res.data.url)

  const session = await oraPromise(authP, {
    text: 'Authenticating with GitHub',
    successText: 'You are now signed in with GitHub.',
    failText: 'Failed to authenticate with GitHub.'
  })
  server.close()

  return session
}
