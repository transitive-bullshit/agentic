import { deployFixtures, publishDeployments } from '../src/project-fixtures'

async function main() {
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
