import { AgenticApiClient } from '@agentic/platform-api-client'

import { examples } from '../src/agentic-examples'
import { deployProjects } from '../src/deploy-projects'
import { fixtures } from '../src/dev-fixtures'
import { env, isProd } from '../src/env'
import { publishDeployments } from '../src/publish-deployments'

export const client = new AgenticApiClient({
  apiBaseUrl: env.AGENTIC_API_BASE_URL
})

async function main() {
  {
    console.log('\n\nCreating "dev" user...\n\n')

    const devAuthSession = await client.signUpWithPassword({
      username: 'dev',
      email: env.AGENTIC_DEV_EMAIL,
      password: env.AGENTIC_DEV_PASSWORD
    })
    console.log(JSON.stringify(devAuthSession, null, 2))

    console.warn(
      `\n\nREMEMBER TO UPDATE "AGENTIC_DEV_ACCESS_TOKEN" in e2e/.env${isProd ? '.production' : ''}\n\n`
    )

    console.log('\n\nDeploying dev fixtures...\n\n')

    const deployments = await deployProjects(fixtures, { client })
    console.log(JSON.stringify(deployments, null, 2))

    console.log('\n\nPublishing dev fixture deployments...\n\n')

    const publishedDeployments = await publishDeployments(deployments, {
      client
    })
    console.log(JSON.stringify(publishedDeployments, null, 2))
  }

  {
    console.log('\n\nCreating "agentic" user...\n\n')

    const agenticAuthSession = await client.signUpWithPassword({
      username: 'agentic',
      email: env.AGENTIC_AGENTIC_EMAIL,
      password: env.AGENTIC_AGENTIC_PASSWORD
    })
    console.log(JSON.stringify(agenticAuthSession, null, 2))

    console.log('\n\nDeploying example projects...\n\n')

    const deployments = await deployProjects(examples, { client })
    console.log(JSON.stringify(deployments, null, 2))

    console.log('\n\nPublishing example project deployments...\n\n')

    const publishedDeployments = await publishDeployments(deployments, {
      client
    })
    console.log(JSON.stringify(publishedDeployments, null, 2))
  }

  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0)
}

await main()
