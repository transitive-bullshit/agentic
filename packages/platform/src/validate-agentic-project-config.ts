import type { AgenticProjectConfig } from '@agentic/platform-types'
import { type Logger } from '@agentic/platform-core'

import { parseAgenticProjectConfig } from './parse-agentic-project-config'
import { resolveMetadata } from './resolve-metadata'
import { validateOriginAdapter } from './validate-origin-adapter'
import { validatePricing } from './validate-pricing'

export async function validateAgenticProjectConfig(
  inputConfig: unknown,
  {
    strip = false,
    ...opts
  }: { logger?: Logger; cwd?: string; strip?: boolean; label?: string } = {}
): Promise<AgenticProjectConfig> {
  const config = parseAgenticProjectConfig(inputConfig, {
    strip,
    strict: !strip
  })

  const { name, version } = resolveMetadata(config)
  validatePricing(config)

  const originAdapter = await validateOriginAdapter({
    name,
    version,
    label: `project "${name}"`,
    ...opts,
    originUrl: config.originUrl,
    originAdapter: config.originAdapter
  })

  return parseAgenticProjectConfig(
    {
      ...config,
      name,
      version,
      originAdapter
    },
    { strip, strict: !strip }
  )
}
