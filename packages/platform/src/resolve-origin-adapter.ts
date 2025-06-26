import type {
  OriginAdapter,
  OriginAdapterConfig,
  Tool
} from '@agentic/platform-types'
import { assert, type Logger } from '@agentic/platform-core'

import { resolveMCPOriginAdapter } from './origin-adapters/mcp'
import { resolveOpenAPIOriginAdapter } from './origin-adapters/openapi'
import { validateOriginUrl } from './validate-origin-url'

/**
 * Validates, normalizes, and resolves the origin adapter config for a project.
 */
export async function resolveOriginAdapter({
  slug,
  version = '0.0.0',
  origin,
  label,
  cwd,
  logger
}: {
  slug: string
  origin: OriginAdapterConfig
  label: string
  version?: string
  cwd?: string
  logger?: Logger
}): Promise<{
  origin: OriginAdapter
  tools?: Tool[]
}> {
  validateOriginUrl({ originUrl: origin.url, label })

  if (origin.type === 'openapi') {
    return resolveOpenAPIOriginAdapter({
      origin,
      label,
      cwd,
      logger
    })
  } else if (origin.type === 'mcp') {
    return resolveMCPOriginAdapter({
      name: slug,
      version,
      origin,
      label
    })
  } else {
    assert(
      origin.type === 'raw',
      400,
      `Invalid origin adapter type "${origin.type}" for ${label}`
    )

    return {
      origin
    }
  }
}
