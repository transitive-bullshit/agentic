import { Command } from 'commander'
import { gracefulExit } from 'exit-hook'
import { oraPromise } from 'ora'

import type { Context } from '../types'
import { AuthStore } from '../lib/auth-store'
import { promptForDeploymentVersion } from '../lib/prompt-for-deployment-version'
import { resolveDeployment } from '../lib/resolve-deployment'

export function registerPublishCommand({
  client,
  program,
  logger,
  handleError
}: Context) {
  const command = new Command('publish')
    .description(
      'Publishes a deployment. Defaults to the most recent deployment for the project in the target directory. If a deployment identifier is provided, it will be used instead.'
    )
    .argument('[deploymentIdentifier]', 'Optional deployment identifier')
    .option(
      '-c, --cwd <dir>',
      'The directory to load the Agentic project config from (defaults to cwd). This directory must contain an "agentic.config.{ts,js,json}" project file.'
    )
    .action(async (deploymentIdentifier, opts) => {
      AuthStore.requireAuth()

      if (deploymentIdentifier) {
        // TODO: parseToolIdentifier
      }

      try {
        const deployment = await oraPromise(
          resolveDeployment({
            client,
            deploymentIdentifier,
            fuzzyDeploymentIdentifierVersion: 'dev',
            cwd: opts.cwd,
            populate: ['project']
          }),
          {
            text: 'Resolving deployment...',
            successText: 'Resolved deployment',
            failText: 'Failed to resolve deployment'
          }
        )
        const { project } = deployment

        if (deployment.published) {
          logger.error(
            deploymentIdentifier
              ? `Deployment "${deploymentIdentifier}" is already published`
              : `Latest deployment "${deployment.identifier}" is already published`
          )
          return gracefulExit(1)
        }

        if (!project) {
          logger.error(
            deploymentIdentifier
              ? `Deployment "${deploymentIdentifier}" failed to fetch project "${deployment.projectId}"`
              : `Latest deployment "${deployment.identifier}" failed to fetch project "${deployment.projectId}"`
          )
          return gracefulExit(1)
        }

        const version = await promptForDeploymentVersion({
          deployment,
          project,
          logger
        })

        if (!version || typeof version !== 'string') {
          logger.error('No version selected')
          return gracefulExit(1)
        }

        const publishedDeployment = await client.publishDeployment(
          {
            version
          },
          {
            deploymentId: deployment.id
          }
        )

        logger.info(
          `Deployment "${publishedDeployment.identifier}" published with version "${publishedDeployment.version}"`
        )
        logger.log(publishedDeployment)
        gracefulExit(0)
      } catch (err) {
        handleError(err)
      }
    })

  program.addCommand(command)
}
