import { AgenticApiClient } from '@agentic/platform-api-client'

import { env } from '../src/env'
import { deployFixtures } from '../src/deploy-fixtures'

export const client = new AgenticApiClient({
  apiBaseUrl: env.AGENTIC_API_BASE_URL
})

async function main() {
  const devAuthSession = await client.signUpWithPassword({
    username: 'dev',
    email: env.AGENTIC_DEV_EMAIL,
    password: env.AGENTIC_DEV_PASSWORD
  })

  console.log(JSON.stringify(devAuthSession, null, 2))

  const deployments = await deployFixtures()
  console.log(JSON.stringify(deployments, null, 2))
}

await main()
