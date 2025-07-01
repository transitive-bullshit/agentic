import type { Deployment, Project } from '@agentic/platform-types'
import { select } from '@clack/prompts'
import { gracefulExit } from 'exit-hook'
import semver from 'semver'

import type { Context } from '../types'

export async function promptForDeploymentVersion({
  deployment,
  project,
  logger
}: {
  deployment: Deployment
  project: Project
  logger: Context['logger']
}): Promise<string | undefined> {
  const initialVersion = deployment.version
  const baseVersion =
    initialVersion || project.lastPublishedDeploymentVersion || '0.0.0'

  const options = [
    initialVersion ? { value: initialVersion, label: initialVersion } : null,
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
    gracefulExit(1)
    return
  }

  return version
}
