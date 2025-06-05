import { select } from '@clack/prompts'
import { Command } from 'commander'
import { oraPromise } from 'ora'
import semver from 'semver'

import type { Context } from '../types'
import { AuthStore } from '../lib/auth-store'
import { resolveDeployment } from '../lib/resolve-deployment'

export function registerPublishCommand({ client, program, logger }: Context) {
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
        return
      }

      if (!project) {
        logger.error(
          deploymentIdentifier
            ? `Deployment "${deploymentIdentifier}" failed to fetch project "${deployment.projectId}"`
            : `Latest deployment "${deployment.identifier}" failed to fetch project "${deployment.projectId}"`
        )
        return
      }

      const initialVersion = deployment.version
      const baseVersion =
        initialVersion || project.lastPublishedDeploymentVersion || '0.0.0'

      const options = [
        initialVersion
          ? { value: initialVersion, label: initialVersion }
          : null,
        {
          value: semver.inc(baseVersion, 'patch'),
          label: `${semver.inc(baseVersion, 'patch')} (patch)`
        },
        {
          value: semver.inc(baseVersion, 'minor'),
          label: `${semver.inc(baseVersion, 'minor')} (minor)`
        },
        {
          value: semver.inc(baseVersion, 'major'),
          label: `${semver.inc(baseVersion, 'major')} (major)`
        }
      ].filter(Boolean)

      if (project.lastPublishedDeploymentVersion) {
        logger.info(
          `Project "${project.identifier}" latest published version is "${project.lastPublishedDeploymentVersion}".\n`
        )
      } else {
        logger.info(`Project "${project.identifier}" is not published yet.\n`)
      }

      const version = await select({
        message: `Select version of deployment "${deployment.identifier}" to publish:`,
        options
      })

      if (!version || typeof version !== 'string') {
        logger.error('No version selected')
        return
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
    })

  program.addCommand(command)
}
