import type { ZodTypeDef } from 'zod'
import { type Logger, parseZodSchema } from '@agentic/platform-core'
import {
  type AgenticProjectConfig,
  type AgenticProjectConfigInput,
  agenticProjectConfigSchema
} from '@agentic/platform-schemas'

import { resolveMetadata } from './resolve-metadata'
import { validateOriginAdapter } from './validate-origin-adapter'
import { validatePricing } from './validate-pricing'

export async function validateAgenticProjectConfig(
  inputConfig: unknown,
  {
    strip = false,
    ...opts
  }: { logger?: Logger; cwd?: URL; strip?: boolean; label?: string } = {}
): Promise<AgenticProjectConfig> {
  const config = parseZodSchema<
    AgenticProjectConfig,
    ZodTypeDef,
    AgenticProjectConfigInput
  >(
    strip
      ? agenticProjectConfigSchema.strip()
      : agenticProjectConfigSchema.strict(),
    inputConfig
  )

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

  return parseZodSchema<
    AgenticProjectConfig,
    ZodTypeDef,
    AgenticProjectConfigInput
  >(
    strip
      ? agenticProjectConfigSchema.strip()
      : agenticProjectConfigSchema.strict(),
    {
      ...config,
      name,
      version,
      originAdapter
    }
  )
}
