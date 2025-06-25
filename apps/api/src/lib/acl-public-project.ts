import { assert } from '@agentic/platform-core'

import type { RawProject } from '@/db'

export async function aclPublicProject(
  project: RawProject | undefined,
  projectId?: string
) {
  assert(
    project,
    404,
    `Public project not found${projectId ? ` "${projectId}"` : ''}`
  )

  assert(
    !project.private && project.lastPublishedDeploymentId,
    404,
    `Public project not found "${project.id}"`
  )

  assert(!project.deletedAt, 410, `Project has been deleted "${project.id}"`)
}
