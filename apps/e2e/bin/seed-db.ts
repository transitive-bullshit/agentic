import { AgenticApiClient } from '@agentic/platform-api-client'

import { deployFixtures } from '../src/deploy-fixtures'
import { env, isProd } from '../src/env'

export const client = new AgenticApiClient({
  apiBaseUrl: env.AGENTIC_API_BASE_URL
})

async function main() {
  // TODO: clear existing tables? and include prompt to double check if so...

  const devAuthSession = await client.signUpWithPassword({
    username: 'dev',
    email: env.AGENTIC_DEV_EMAIL,
    password: env.AGENTIC_DEV_PASSWORD
  })
  console.log(JSON.stringify(devAuthSession, null, 2))

  console.warn(
    `\n\nREMEMBER TO UPDATE "AGENTIC_DEV_ACCESS_TOKEN" in e2e/.env${isProd ? '.production' : ''}\n\n`
  )

  const deployments = await deployFixtures()
  console.log(JSON.stringify(deployments, null, 2))
}

await main()
