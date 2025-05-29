import type { OriginAdapterConfig } from '@agentic/platform-schemas'
import { assert, type Logger } from '@agentic/platform-core'

import { resolveMCPOriginAdapter } from './origin-adapters/mcp'
import { resolveOpenAPIOriginAdapter } from './origin-adapters/openapi'
import { validateOriginUrl } from './validate-origin-url'

/**
 * Validates and normalizes the origin adapter for a project.
 */
export async function validateOriginAdapter({
  name,
  version = '0.0.0',
  originUrl,
  originAdapter,
  label,
  cwd,
  logger
}: {
  name: string
  originUrl: string
  originAdapter: Readonly<OriginAdapterConfig>
  label: string
  version?: string
  cwd?: URL
  logger?: Logger
}): Promise<OriginAdapterConfig> {
  validateOriginUrl({ originUrl, label })

  if (originAdapter.type === 'openapi') {
    // We intentionally ignore the resolved tools here because the server will
    // need to re-validate the OpenAPI spec and tools anyway. We do, however,
    // override the `spec` field with the parsed, normalized version because
    // that may have been pointing to a local file or remote URL.
    const { originAdapter: resolvedOriginAdapter } =
      await resolveOpenAPIOriginAdapter({
        originAdapter,
        label,
        cwd,
        logger
      })

    return {
      ...originAdapter,
      spec: resolvedOriginAdapter.spec
    }
  } else if (originAdapter.type === 'mcp') {
    // We intentionally ignore the resolved version and tools here because the
    // server will need to re-validate the MCP server info and tools anyway.
    await resolveMCPOriginAdapter({
      name,
      version,
      originUrl,
      originAdapter,
      label
    })

    return originAdapter
  } else {
    assert(
      originAdapter.type === 'raw',
      400,
      `Invalid origin adapter type "${originAdapter.type}" for ${label}`
    )

    return originAdapter
  }
}
