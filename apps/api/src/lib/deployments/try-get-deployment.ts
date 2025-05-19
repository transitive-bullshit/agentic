import { assert } from '@agentic/platform-core'
import { parseFaasIdentifier } from '@agentic/validators'

import type { AuthenticatedContext } from '@/lib/types'
import { db, eq, type RawDeployment, schema } from '@/db'
import { ensureAuthUser } from '@/lib/ensure-auth-user'

/**
 * Attempts to find the Deployment matching the given identifier.
 */
export async function tryGetDeployment(
  ctx: AuthenticatedContext,
  identifier: string,
  dbQueryOpts: {
    with?: {
      user?: true
      team?: true
      project?: true
    }
  } = {}
): Promise<RawDeployment | undefined> {
  const user = await ensureAuthUser(ctx)

  const teamMember = ctx.get('teamMember')
  const namespace = teamMember ? teamMember.teamSlug : user.username
  const parsedFaas = parseFaasIdentifier(identifier, {
    namespace
  })
  assert(parsedFaas, 400, `Invalid deployment identifier "${identifier}"`)

  const { projectId, deploymentHash, version } = parsedFaas

  if (deploymentHash) {
    const deploymentId = `${projectId}@${deploymentHash}`

    const deployment = await db.query.deployments.findFirst({
      ...dbQueryOpts,
      where: eq(schema.deployments.id, deploymentId)
    })
    assert(deployment, 404, `Deployment not found "${deploymentId}"`)

    return deployment
  } else if (version === 'latest') {
    const project = await db.query.projects.findFirst({
      ...dbQueryOpts,
      where: eq(schema.projects.id, projectId)
    })
    assert(project, 404, `Project not found "${projectId}"`)
    assert(
      project.lastPublishedDeploymentId,
      404,
      'Project has no published deployments'
    )

    const deployment = await db.query.deployments.findFirst({
      ...dbQueryOpts,
      where: eq(schema.deployments.id, project.lastPublishedDeploymentId)
    })
    assert(
      deployment,
      404,
      `Deployment not found "${project.lastPublishedDeploymentId}"`
    )

    return deployment
  } else if (version === 'dev') {
    const project = await db.query.projects.findFirst({
      ...dbQueryOpts,
      where: eq(schema.projects.id, projectId)
    })
    assert(project, 404, `Project not found "${projectId}"`)
    assert(
      project.lastDeploymentId,
      404,
      'Project has no published deployments'
    )

    const deployment = await db.query.deployments.findFirst({
      ...dbQueryOpts,
      where: eq(schema.deployments.id, project.lastDeploymentId)
    })
    assert(
      deployment,
      404,
      `Deployment not found "${project.lastDeploymentId}"`
    )

    return deployment
  }

  assert(false, 400, `Invalid Deployment identifier "${identifier}"`)
}
