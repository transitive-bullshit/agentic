import { Command } from 'commander'

import type { Context } from '../types'
import { resolveDeployment } from '../lib/resolve-deployment'
import { AuthStore } from '../lib/store'

export function registerPublishCommand({ client, program, logger }: Context) {
  const command = new Command('publish')
    .description('Publishes a deployment')
    .argument('[deploymentIdentifier]', 'Deployment identifier')
    .option(
      '-c, --cwd <dir>',
      'The directory to load the Agentic project config from (defaults to cwd). This directory must contain an "agentic.config.{ts,js,json}" project file.'
    )
    .action(async (deploymentIdentifier, opts) => {
      AuthStore.requireAuth()

      if (deploymentIdentifier) {
        // TODO: parseFaasIdentifier
      }

      const deployment = await resolveDeployment({
        client,
        deploymentIdentifier,
        fuzzyDeploymentIdentifierVersion: 'dev',
        cwd: opts.cwd,
        populate: ['project']
      })

      if (deployment.published) {
        logger.error(
          deploymentIdentifier
            ? `Deployment "${deploymentIdentifier}" is already published`
            : `Latest deployment "${deployment.identifier}" is already published`
        )
        return
      }

      // TODO
      // const version = deployment.version

      // // TODO: prompt user for version or bump

      // await client.publishDeployment(
      //   {
      //     version
      //   },
      //   {
      //     deploymentId: deployment.id
      //   }
      // )

      logger.log(deployment)
    })

  program.addCommand(command)
}
