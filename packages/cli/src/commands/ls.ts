import { Command } from 'commander'
import ora from 'ora'

import { client } from '../client'

export const ls = new Command('ls')
  .alias('list')
  .description('Lists deployments by project')
  .argument('[project]', 'project ID')
  .action(async (projectId?: string) => {
    const spinner = ora('Fetching deployments').start()
    try {
      const deployments = await client.listDeployments({ projectId })
      spinner.succeed('Deployments retrieved')
      console.log(JSON.stringify(deployments, null, 2))
    } catch (err) {
      spinner.fail('Failed to fetch deployments')
      console.error(err)
      process.exit(1)
    }
  })
