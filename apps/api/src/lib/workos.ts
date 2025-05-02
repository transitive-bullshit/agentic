import { WorkOS } from '@workos-inc/node'

import { env } from './env'

export const workos = new WorkOS(env.WORKOS_API_KEY, {
  clientId: env.WORKOS_CLIENT_ID
})
