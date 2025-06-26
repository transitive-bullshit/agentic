import type { OriginAdapterConfig } from '@agentic/platform-types'
import { assert, type Logger } from '@agentic/platform-core'

import { resolveMCPOriginAdapter } from './origin-adapters/mcp'
import { resolveOpenAPIOriginAdapter } from './origin-adapters/openapi'
import { validateOriginUrl } from './validate-origin-url'

/**
 * Validates and normalizes the origin adapter for a project.
 */
export async function validateOriginAdapter({
  slug,
  version = '0.0.0',
  origin,
  label,
  cwd,
  logger
}: {
  slug: string
  origin: Readonly<OriginAdapterConfig>
  label: string
  version?: string
  cwd?: string
  logger?: Logger
}): Promise<OriginAdapterConfig> {
  validateOriginUrl({ originUrl: origin.url, label })

  if (origin.type === 'openapi') {
    // We intentionally ignore the resolved tools here because the server will
    // need to re-validate the OpenAPI spec and tools anyway. We do, however,
    // override the `spec` field with the parsed, normalized version because
    // that may have been pointing to a local file or remote URL.
    const { origin: resolvedOriginAdapter } = await resolveOpenAPIOriginAdapter(
      {
        origin,
        label,
        cwd,
        logger
      }
    )

    return {
      ...origin,
      spec: resolvedOriginAdapter.spec
    }
  } else if (origin.type === 'mcp') {
    // We intentionally ignore the resolved version and tools here because the
    // server will need to re-validate the MCP server info and tools anyway.
    await resolveMCPOriginAdapter({
      name: slug,
      version,
      origin,
      label
    })

    return origin
  } else {
    assert(
      origin.type === 'raw',
      400,
      `Invalid origin adapter type "${origin.type}" for ${label}`
    )

    return origin
  }
}
