import { AgenticApiClient } from '@agentic/platform-api-client'

import { env, isProd } from '../src/env'
import { deployFixtures, publishDeployments } from '../src/project-fixtures'

export const client = new AgenticApiClient({
  apiBaseUrl: env.AGENTIC_API_BASE_URL
})

async function main() {
  // TODO: clear existing tables? and include prompt to double check if so...

  console.log('\n\nCreating dev user...\n\n')

  const devAuthSession = await client.signUpWithPassword({
    username: 'dev',
    email: env.AGENTIC_DEV_EMAIL,
    password: env.AGENTIC_DEV_PASSWORD
  })
  console.log(JSON.stringify(devAuthSession, null, 2))

  console.warn(
    `\n\nREMEMBER TO UPDATE "AGENTIC_DEV_ACCESS_TOKEN" in e2e/.env${isProd ? '.production' : ''}\n\n`
  )

  console.log('\n\nDeploying fixtures...\n\n')

  const deployments = await deployFixtures()
  console.log(JSON.stringify(deployments, null, 2))

  console.log('\n\nPublishing deployments...\n\n')

  const publishedDeployments = await publishDeployments(deployments)
  console.log(JSON.stringify(publishedDeployments, null, 2))

  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0)
}

await main()
