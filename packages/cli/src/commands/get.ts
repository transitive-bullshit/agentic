import { Command } from 'commander'
import { oraPromise } from 'ora'

import type { Context } from '../types'
import { AuthStore } from '../lib/auth-store'

export function registerGetDeploymentCommand({
  client,
  program,
  logger
}: Context) {
  const command = new Command('get')
    .description('Gets details for a specific deployment.')
    .argument('<deploymentIdentifier>', 'Deployment ID or identifier')
    .action(async (deploymentIdentifier) => {
      AuthStore.requireAuth()

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
    })

  program.addCommand(command)
}
