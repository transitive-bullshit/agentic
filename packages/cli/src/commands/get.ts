import { Command } from 'commander'
import ora from 'ora'

import { client } from '../client'

export const get = new Command('get')
  .description('Gets details for a specific deployment')
  .argument('<id>', 'deployment ID')
  .action(async (id: string) => {
    const spinner = ora('Fetching deployment details').start()
    try {
      const deployment = await client.getDeployment({ deploymentId: id })
      spinner.succeed('Deployment details retrieved')
      console.log(JSON.stringify(deployment, null, 2))
    } catch (err) {
      spinner.fail('Failed to fetch deployment details')
      console.error(err)
      process.exit(1)
    }
  })
