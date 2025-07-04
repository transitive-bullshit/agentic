import { assert } from '@agentic/platform-core'

import type { AuthenticatedHonoContext } from '@/lib/types'
import { db, eq, type RawDeployment, schema } from '@/db'
import { acl } from '@/lib/acl'

import { normalizeDeploymentVersion } from './normalize-deployment-version'

export async function publishDeployment(
  ctx: AuthenticatedHonoContext,
  {
    deployment,
    version: rawVersion
  }: {
    deployment: RawDeployment
    version: string
  }
): Promise<RawDeployment> {
  const project = await db.query.projects.findFirst({
    where: eq(schema.projects.id, deployment.projectId),
    with: {
      lastPublishedDeployment: true
    }
  })
  assert(project, 404, `Project not found "${deployment.projectId}"`)
  await acl(ctx, project, { label: 'Project' })

  const version = normalizeDeploymentVersion({
    deploymentIdentifier: deployment.identifier,
    project,
    version: rawVersion
  })

  // TODO: enforce additional semver constraints
  // - pricing changes require major version update
  // - deployment shouldn't already be published?
  // - any others?

  // Update the deployment and project together in a transaction
  const [[updatedDeployment]] = await db.transaction(async (tx) => {
    return Promise.all([
      // Update the deployment
      tx
        .update(schema.deployments)
        .set({
          published: true,
          version
        })
        .where(eq(schema.deployments.id, deployment.id))
        .returning(),

      // Update the project
      tx
        .update(schema.projects)
        .set({
          name: deployment.name,
          lastPublishedDeploymentId: deployment.id,
          lastPublishedDeploymentVersion: version
        })
        .where(eq(schema.projects.id, project.id))

      // TODO: add publishDeploymentLogEntry
    ])
  })
  assert(
    updatedDeployment,
    500,
    `Failed to update deployment "${deployment.id}"`
  )

  return updatedDeployment
}
