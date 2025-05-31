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
  originAdapter: OriginAdapterConfig
  label: string
  version?: string
  cwd?: URL
  logger?: Logger
}): Promise<{
  originAdapter: OriginAdapter
  tools?: Tool[]
}> {
  validateOriginUrl({ originUrl, label })

  if (originAdapter.type === 'openapi') {
    return resolveOpenAPIOriginAdapter({
      originAdapter,
      label,
      cwd,
      logger
    })
  } else if (originAdapter.type === 'mcp') {
    return resolveMCPOriginAdapter({
      name,
      version,
      originUrl,
      originAdapter,
      label
    })
  } else {
    assert(
      originAdapter.type === 'raw',
      400,
      `Invalid origin adapter type "${originAdapter.type}" for ${label}`
    )

    return {
      originAdapter
    }
  }
}
