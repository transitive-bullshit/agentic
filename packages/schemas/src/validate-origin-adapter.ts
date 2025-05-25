import type { DeploymentOriginAdapter } from '@agentic/platform-schemas'
import { assert, type Logger } from '@agentic/platform-core'
import { validateOpenAPISpec } from '@agentic/platform-openapi'

/**
 * Validates and normalizes the origin adapter config for a project.
 *
 * NOTE: This method may mutate `originAdapter.spec`.
 */
export async function validateOriginAdapter({
  originUrl,
  originAdapter,
  label,
  cwd,
  logger
}: {
  originUrl: string
  originAdapter: DeploymentOriginAdapter
  label: string
  cwd?: URL
  logger?: Logger
}): Promise<void> {
  assert(originUrl, 400, `Origin URL is required for ${label}`)

  if (originAdapter.type === 'openapi') {
    assert(
      originAdapter.spec,
      400,
      `OpenAPI spec is required for ${label} with origin adapter type set to "openapi"`
    )

    // Validate and normalize the OpenAPI spec
    const openapiSpec = await validateOpenAPISpec(originAdapter.spec, {
      cwd,
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
      `Invalid origin adapter type "${originAdapter.type}" for ${label}`
    )
  }
}
