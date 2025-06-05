import type { Logger } from '@agentic/platform-core'
import type {
  AgenticProjectConfig,
  AgenticProjectConfigRaw,
  ResolvedAgenticProjectConfig
} from '@agentic/platform-types'

import {
  parseAgenticProjectConfig,
  parseResolvedAgenticProjectConfig
} from './parse-agentic-project-config'
import { resolveMetadata } from './resolve-metadata'
import { resolveOriginAdapter } from './resolve-origin-adapter'
import { validatePricing } from './validate-pricing'
import { validateTools } from './validate-tools'

export async function resolveAgenticProjectConfig(
  inputConfig: AgenticProjectConfig | AgenticProjectConfigRaw,
  opts: { logger?: Logger; cwd?: string; label?: string } = {}
): Promise<ResolvedAgenticProjectConfig> {
  const config = parseAgenticProjectConfig(inputConfig)

  const { name, version } = resolveMetadata(config)
  validatePricing(config)

  const { originAdapter, tools } = await resolveOriginAdapter({
    name,
    version,
    label: `project "${name}"`,
    ...opts,
    originUrl: config.originUrl,
    originAdapter: config.originAdapter
  })

  const resolvedConfig = parseResolvedAgenticProjectConfig({
    ...config,
    name,
    version,
    originAdapter,
    tools
  })

  validateTools({
    label: `project "${name}"`,
    ...opts,
    originAdapter: resolvedConfig.originAdapter,
    tools: resolvedConfig.tools,
    toolConfigs: resolvedConfig.toolConfigs || []
  })

  return resolvedConfig
}
