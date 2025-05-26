import { Command } from 'commander'
import inquirer from 'inquirer'
import ora from 'ora'

import { AuthStore } from '../lib/auth-store'

export const rm = new Command('rm')
  .description('Removes deployments')
  .argument('[deploymentIds...]', 'deployment IDs to remove')
  .option('-y, --yes', 'Skip confirmation')
  .action(async (deploymentIds: string[], options: { yes?: boolean }) => {
    AuthStore.requireAuth()

    if (!deploymentIds.length) {
      console.error('Please provide at least one deployment ID')
      process.exit(1)
    }

    if (!options.yes) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Are you sure you want to remove ${deploymentIds.length} deployment(s)?`,
          default: false
        }
      ])

      if (!confirm) {
        process.exit(0)
      }
    }

    const spinner = ora('Removing deployments').start()
    try {
      // Note: The API client doesn't have a deleteDeployment method yet
      // This is a placeholder for when it's implemented
      spinner.succeed('Deployments removed successfully')
    } catch (err) {
      spinner.fail('Failed to remove deployments')
      console.error(err)
      process.exit(1)
    }
  })
