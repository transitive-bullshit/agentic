import { Command } from 'commander'
import { gracefulExit } from 'exit-hook'
import { oraPromise } from 'ora'

import type { Context } from '../types'
import { AuthStore } from '../lib/auth-store'

export function registerGetDeploymentCommand({
  client,
  program,
  logger,
  handleError
}: Context) {
  const command = new Command('get')
    .description('Gets details for a specific deployment.')
    .argument('<deploymentIdentifier>', 'Deployment ID or identifier')
    .action(async (deploymentIdentifier) => {
      AuthStore.requireAuth()

      try {
        const deployment = await oraPromise(
          client.getDeploymentByIdentifier({
            deploymentIdentifier
          }),
          {
            text: 'Resolving deployment...',
            successText: 'Resolved deployment',
            failText: 'Failed to resolve deployment'
          }
        )

        logger.log(deployment)
        gracefulExit(0)
      } catch (err) {
        handleError(err)
      }
    })

  program.addCommand(command)
}
