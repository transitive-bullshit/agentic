import type { DeploymentOriginAdapter } from '@/db/schema'
import { assert } from '@/lib/utils'

export async function validateDeploymentOriginAdapter({
  deploymentId,
  originUrl,
  originAdapter
}: {
  deploymentId: string
  originUrl: string
  originAdapter: DeploymentOriginAdapter
}): Promise<void> {
  assert(
    originUrl,
    400,
    `Origin URL is required for deployment "${deploymentId}"`
  )

  if (originAdapter.type === 'openapi') {
    // TODO: Validate OpenAPI spec
    assert(
      originAdapter.spec,
      400,
      `OpenAPI spec is required for deployment "${deploymentId}"`
    )

    // TODO: Validate OpenAPI spec version is the same as `originAdapter.version`

    // TODO: Remove origin servers from the OpenAPI spec and if they exist, ensure
    // that `originUrl` matches.
  } else {
    assert(
      originAdapter.type === 'raw',
      400,
      `Invalid origin adapter type "${originAdapter.type}" for deployment "${deploymentId}"`
    )
  }
}
