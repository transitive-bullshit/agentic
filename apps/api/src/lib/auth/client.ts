import { createClient as createAuthClient } from '@agentic/openauth/client'

export const authClient = createAuthClient({
  issuer: 'http://localhost:3000',
  clientID: 'agentic-internal-api-client'
})
