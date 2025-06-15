import { deployFixtures } from '../src/deploy-fixtures'

async function main() {
  const deployments = await deployFixtures()

  console.log(JSON.stringify(deployments, null, 2))
}

await main()
