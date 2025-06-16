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

import { AuthStore } from './auth-store'

const providerToLabel = {
  github: 'GitHub'
  // password: 'email and password'
}

export async function auth({
  client,
  provider,
  preferredPort = 6013
}: {
  client: AgenticApiClient
  provider: 'github' // | 'password'
  preferredPort?: number
}): Promise<AuthSession> {
  const providerLabel = providerToLabel[provider]
  assert(providerLabel, `Missing required provider: ${provider}`)

  const port = await getPort({ port: preferredPort })
  const app = new Hono()

  const redirectUri = `http://localhost:${port}/callback/${provider}/success`
  let _resolveAuth: any
  let _rejectAuth: any

  // NOTE: Promise.withResolvers requires Node.js 22+
  const authP = new Promise<AuthSession>((resolve, reject) => {
    _resolveAuth = resolve
    _rejectAuth = reject
  })

  app.get(`/callback/${provider}/success`, async (c) => {
    // console.log(`/callback/${provider}/success`, c.req.method, c.req.url, {
    //   headers: c.req.header(),
    //   query: c.req.query()
    // })

    const code = c.req.query('code')
    assert(code, 'Missing required code query parameter')

    await client.exchangeOAuthCodeWithGitHub({ code })
    assert(
      client.authSession,
      `Error ${providerLabel} auth: failed to exchange auth code for token`
    )

    // await client.exchangeAuthCode({
    //   code,
    //   redirectUri,
    //   verifier: authorizeResult.challenge?.verifier
    // })
    // assert(
    //   client.authSession,
    //   `Error ${providerLabel} auth: failed to exchange auth code for token`
    // )

    // AuthStore should be updated via the onUpdateAuth callback
    const session = AuthStore.tryGetAuth()
    assert(session && session?.token === client.authSession?.token)
    _resolveAuth(session)

    return c.text(
      `Huzzah! You are now signed in to the Agentic CLI.\n\nYou may close this browser tab. 😄`
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

  const url = await client.initAuthFlowWithGitHub({
    redirectUri
  })
  await open(url.toString())

  // TODO
  // const authorizeResult = await client.initAuthFlow({
  //   provider,
  //   redirectUri
  // })
  // assert(authorizeResult.url, `Error signing in with ${providerLabel}`)
  // await open(authorizeResult.url)

  const authSession = await oraPromise(authP, {
    text: `Signing in with ${providerLabel}`,
    successText: 'You are now signed in.',
    failText: 'Failed to sign in.'
  })
  server.close()

  return authSession
}
