import type { AgenticProjectConfig } from '@agentic/platform-types'
import { loadConfig } from 'unconfig'

import { validateAgenticProjectConfig } from './validate-agentic-project-config'

export async function loadAgenticConfig({
  cwd
}: {
  cwd?: string
} = {}): Promise<AgenticProjectConfig> {
  const { config } = await loadConfig({
    cwd,
    sources: [
      {
        files: 'agentic.config',
        extensions: ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json']
      }
    ]
  })

  return validateAgenticProjectConfig(config)
}
