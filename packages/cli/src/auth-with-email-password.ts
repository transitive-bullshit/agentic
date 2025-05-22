import type {
  AgenticApiClient,
  AuthSession
} from '@agentic/platform-api-client'
import { assert } from '@agentic/platform-core'

import { AuthStore } from './store'

export async function authWithEmailPassword({
  client,
  email,
  password
}: {
  client: AgenticApiClient
  email: string
  password: string
}): Promise<AuthSession> {
  let cookie: string | undefined
  await client.authClient.signIn.email({
    email,
    password,
    fetchOptions: {
      onSuccess: ({ response }) => {
        cookie = response.headers.get('set-cookie')!
      }
    }
  })
  assert(cookie, 'Failed to get auth cookie')

  const session = await client.setAuthSession(cookie)
  assert(session, 'Failed to get auth session')
  AuthStore.setAuth({ cookie, session })

  return session
}
