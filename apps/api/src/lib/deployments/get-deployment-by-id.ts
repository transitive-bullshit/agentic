import { assert } from '@agentic/platform-core'

import { db, eq, type RawDeployment, schema } from '@/db'

/**
 * Finds the Deployment with the given id.
 *
 * Does not take care of ACLs.
 *
 * Returns `undefined` if not found.
 */
export async function getDeploymentById({
  deploymentId,
  ...dbQueryOpts
}: {
  deploymentId: string
  with?: {
    user?: true
    team?: true
    project?: true
  }
}): Promise<RawDeployment | undefined> {
  assert(deploymentId, 400, 'Missing required deployment id')

  const deployment = await db.query.deployments.findFirst({
    ...dbQueryOpts,
    where: eq(schema.deployments.id, deploymentId)
  })

  return deployment
}
