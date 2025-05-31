import { type Logger, parseZodSchema } from '@agentic/platform-core'
import {
  type AgenticProjectConfig,
  agenticProjectConfigSchema,
  type ResolvedAgenticProjectConfig,
  resolvedAgenticProjectConfigSchema
} from '@agentic/platform-types'

import { resolveMetadata } from './resolve-metadata'
import { resolveOriginAdapter } from './resolve-origin-adapter'
import { validatePricing } from './validate-pricing'
import { validateTools } from './validate-tools'

export async function resolveAgenticProjectConfig(
  inputConfig: AgenticProjectConfig,
  opts: { logger?: Logger; cwd?: URL; label?: string } = {}
): Promise<ResolvedAgenticProjectConfig> {
  const config = parseZodSchema(agenticProjectConfigSchema.strip(), inputConfig)

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

  const resolvedConfig = parseZodSchema(resolvedAgenticProjectConfigSchema, {
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
