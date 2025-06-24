import { deployProjects } from '../src/deploy-projects'
import { devClient } from '../src/dev-client'
import { fixtures } from '../src/dev-fixtures'

async function main() {
  console.log('\n\nDeploying dev fixtures...\n\n')

  const deployments = await deployProjects(fixtures, { client: devClient })
  console.log(JSON.stringify(deployments, null, 2))

  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0)
}

await main()
