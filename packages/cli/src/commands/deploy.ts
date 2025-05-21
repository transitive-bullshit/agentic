import fs from 'node:fs/promises'
import path from 'node:path'

import { Command } from 'commander'
import ora from 'ora'

import { client } from '../client'

export const deploy = new Command('deploy')
  .description('Creates a new deployment')
  .argument('[path]', 'path to project directory', process.cwd())
  .action(async (projectPath: string) => {
    const spinner = ora('Creating deployment').start()
    try {
      // Read agentic.json from the project path
      const configPath = path.join(projectPath, 'agentic.json')
      const configContent = await fs.readFile(configPath, 'utf8')
      const config = JSON.parse(configContent)

      const deployment = await client.createDeployment(
        {
          identifier: config.name,
          projectId: config.projectId,
          version: config.version,
          originUrl: config.originUrl || '',
          pricingPlans: config.pricingPlans || []
        },
        {}
      )
      spinner.succeed('Deployment created successfully')
      console.log(JSON.stringify(deployment, null, 2))
    } catch (err) {
      spinner.fail('Failed to create deployment')
      console.error(err)
      process.exit(1)
    }
  })
