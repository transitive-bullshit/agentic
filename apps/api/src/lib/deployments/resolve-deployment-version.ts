import semver from 'semver'

import type { RawProject } from '@/db/types'
import { assert } from '@/lib/utils'

export function resolveDeploymentVersion({
  deploymentId,
  version: rawVersion,
  project
}: {
  deploymentId: string
  version: string
  project: RawProject
}): string | undefined {
  const version = semver.clean(rawVersion)
  assert(version, 400, `Invalid semver version "${rawVersion}"`)

  assert(
    semver.valid(version),
    400,
    `Invalid semver version "${version}" for deployment "${deploymentId}"`
  )

  const lastPublishedVersion = project.lastPublishedDeployment?.version
  assert(
    !lastPublishedVersion || semver.gt(version, lastPublishedVersion),
    400,
    `Semver version "${version}" must be greater than the current published version "${lastPublishedVersion}" for deployment "${deploymentId}"`
  )

  return version
}
