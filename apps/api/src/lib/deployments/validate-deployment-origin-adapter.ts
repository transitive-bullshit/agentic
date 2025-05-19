import type { DeploymentOriginAdapter } from '@/db/schema'
import type { Logger } from '@/lib/logger'
import { assert } from '@/lib/utils'
import { validateOpenAPISpec } from '@/lib/validate-openapi-spec'

/**
 * Validates and normalizes the origin adapter config for a deployment.
 *
 * NOTE: This method may mutate `originAdapter.spec`.
 */
export async function validateDeploymentOriginAdapter({
  deploymentId,
  originUrl,
  originAdapter,
  logger
}: {
  deploymentId: string
  originUrl: string
  originAdapter: DeploymentOriginAdapter
  logger: Logger
}): Promise<void> {
  assert(
    originUrl,
    400,
    `Origin URL is required for deployment "${deploymentId}"`
  )

  if (originAdapter.type === 'openapi') {
    assert(
      originAdapter.spec,
      400,
      `OpenAPI spec is required for deployment "${deploymentId}" with origin adapter type set to "openapi"`
    )

    // Validate and normalize the OpenAPI spec
    const openapiSpec = await validateOpenAPISpec(originAdapter.spec, {
      logger
    })

    // Remove origin servers from the OpenAPI spec.
    // TODO: Ensure that `originUrl` matches any origin servers in the openapi spec?
    delete openapiSpec.servers

    // TODO: Additional, agentic-specific validation of the OpenAPI spec's
    // operations to ensure they are valid AI functions.

    // TODO: Simplify OpenAPI spec by removing any query params and headers
    // specific to the Agentic API gateway.

    // Update the openapi spec with the normalized version
    originAdapter.spec = JSON.stringify(openapiSpec)
  } else {
    assert(
      originAdapter.type === 'raw',
      400,
      `Invalid origin adapter type "${originAdapter.type}" for deployment "${deploymentId}"`
    )
  }
}
