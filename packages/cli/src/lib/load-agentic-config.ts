import type { AgenticProjectConfigOutput } from '@agentic/platform-schemas'
import { loadConfig } from 'unconfig'

import { validateAgenticConfig } from './validate-agentic-config'

export async function loadAgenticConfig({
  cwd
}: {
  cwd?: string
}): Promise<AgenticProjectConfigOutput> {
  const { config } = await loadConfig({
    cwd,
    sources: [
      {
        files: 'agentic.config',
        extensions: ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json']
      }
    ]
  })

  return validateAgenticConfig(config)
}
