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

  const { slug, version } = resolveMetadata(config)
  validatePricing(config)

  const { origin, tools } = await resolveOriginAdapter({
    slug,
    version,
    label: `project "${slug}"`,
    ...opts,
    origin: config.origin
  })

  const resolvedConfig = parseResolvedAgenticProjectConfig({
    ...config,
    slug,
    version,
    origin,
    tools
  })

  validateTools({
    label: `project "${slug}"`,
    ...opts,
    origin: resolvedConfig.origin,
    tools: resolvedConfig.tools,
    toolConfigs: resolvedConfig.toolConfigs
  })

  return resolvedConfig
}
