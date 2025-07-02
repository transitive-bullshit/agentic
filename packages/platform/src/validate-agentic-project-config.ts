import type { AgenticProjectConfig } from '@agentic/platform-types'
import { type Logger } from '@agentic/platform-core'

import { parseAgenticProjectConfig } from './parse-agentic-project-config'
import { resolveMetadata } from './resolve-metadata'
import { validateMetadataFiles } from './validate-metadata-files'
import { validateOriginAdapter } from './validate-origin-adapter'
import { validatePricing } from './validate-pricing'

export async function validateAgenticProjectConfig(
  inputConfig: unknown,
  {
    strip = false,
    ...opts
  }: {
    logger?: Logger
    cwd?: string
    strip?: boolean
    label?: string
  } = {}
): Promise<AgenticProjectConfig> {
  const config = parseAgenticProjectConfig(inputConfig, {
    strip,
    strict: !strip
  })

  const { slug, version } = await resolveMetadata(config)
  validatePricing(config)

  const { readme, icon } = await validateMetadataFiles(config, opts)
  const origin = await validateOriginAdapter({
    slug,
    version,
    label: `project "${slug}"`,
    ...opts,
    origin: config.origin
  })

  return parseAgenticProjectConfig(
    {
      ...config,
      slug,
      version,
      readme,
      icon,
      origin
    },
    { strip, strict: !strip }
  )
}
