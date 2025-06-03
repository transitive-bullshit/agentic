import { assert } from '@agentic/platform-core'
import { parseToolIdentifier } from '@agentic/platform-validators'

import type { AuthenticatedContext } from '@/lib/types'
import {
  and,
  db,
  deploymentIdSchema,
  eq,
  type RawDeployment,
  schema
} from '@/db'
import { setPublicCacheControl } from '@/lib/cache-control'

/**
 * Attempts to find the Deployment matching the given deployment ID or
 * identifier.
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
  assert(deploymentIdentifier, 400, 'Missing required deployment identifier')

  // First check if the identifier is a deployment ID
  if (deploymentIdSchema.safeParse(deploymentIdentifier).success) {
    const deployment = await db.query.deployments.findFirst({
      ...dbQueryOpts,
      where: eq(schema.deployments.id, deploymentIdentifier)
    })
    assert(deployment, 404, `Deployment not found "${deploymentIdentifier}"`)
    setPublicCacheControl(ctx.res, '1h')
    return deployment
  }

  const parsedFaas = parseToolIdentifier(deploymentIdentifier)
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
    setPublicCacheControl(ctx.res, '1h')

    return deployment
  } else if (version) {
    const project = await db.query.projects.findFirst({
      where: eq(schema.projects.identifier, projectIdentifier)
    })
    assert(project, 404, `Project not found "${projectIdentifier}"`)

    if (version === 'latest') {
      const deploymentId =
        project.lastPublishedDeploymentId || project.lastDeploymentId
      assert(deploymentId, 404, 'Project has no published deployments')

      const deployment = await db.query.deployments.findFirst({
        ...dbQueryOpts,
        where: eq(schema.deployments.id, deploymentId)
      })
      assert(
        deployment,
        404,
        `Deployment not found "${project.lastPublishedDeploymentId}"`
      )
      setPublicCacheControl(ctx.res, '10s')

      return deployment
    } else if (version === 'dev') {
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
      setPublicCacheControl(ctx.res, '10s')

      return deployment
    } else {
      const deployment = await db.query.deployments.findFirst({
        ...dbQueryOpts,
        where: and(
          eq(schema.deployments.projectId, project.id),
          eq(schema.deployments.version, version)
        )
      })
      assert(
        deployment,
        404,
        `Deployment not found "${projectIdentifier}@${version}"`
      )
      setPublicCacheControl(ctx.res, '1h')

      return deployment
    }
  }

  assert(false, 400, `Invalid Deployment identifier "${deploymentIdentifier}"`)
}
