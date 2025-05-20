import { assert } from '@agentic/platform-core'
import { parseFaasIdentifier } from '@agentic/platform-validators'

import type { AuthenticatedContext } from '@/lib/types'
import { db, eq, type RawDeployment, schema } from '@/db'
import { ensureAuthUser } from '@/lib/ensure-auth-user'

/**
 * Attempts to find the Deployment matching the given deployment identifier.
 *
 * Throws a HTTP 404 error if not found.
 *
 * Does not take care of ACLs.
 */
export async function tryGetDeploymentByIdentifier(
  ctx: AuthenticatedContext,
  {
    deploymentIdentifier,
    ...dbQueryOpts
  }: {
    deploymentIdentifier: string
    with?: {
      user?: true
      team?: true
      project?: true
    }
  }
): Promise<RawDeployment> {
  const user = await ensureAuthUser(ctx)

  const teamMember = ctx.get('teamMember')
  const namespace = teamMember ? teamMember.teamSlug : user.username
  const parsedFaas = parseFaasIdentifier(deploymentIdentifier, {
    namespace
  })
  assert(
    parsedFaas,
    400,
    `Invalid deployment identifier "${deploymentIdentifier}"`
  )

  const { projectIdentifier, deploymentHash, version } = parsedFaas

  if (deploymentHash) {
    const deploymentIdentifier = `${projectIdentifier}@${deploymentHash}`

    const deployment = await db.query.deployments.findFirst({
      ...dbQueryOpts,
      where: eq(schema.deployments.identifier, deploymentIdentifier)
    })
    assert(deployment, 404, `Deployment not found "${deploymentIdentifier}"`)

    return deployment
  } else if (version === 'latest') {
    const project = await db.query.projects.findFirst({
      ...dbQueryOpts,
      where: eq(schema.projects.identifier, projectIdentifier)
    })
    assert(project, 404, `Project not found "${projectIdentifier}"`)
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
      where: eq(schema.projects.id, projectIdentifier)
    })
    assert(project, 404, `Project not found "${projectIdentifier}"`)
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

  assert(false, 400, `Invalid Deployment identifier "${deploymentIdentifier}"`)
}
