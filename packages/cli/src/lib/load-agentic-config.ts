import type { AgenticProjectConfig } from '@agentic/platform-types'
import { validateAgenticProjectConfig } from '@agentic/platform'
import { loadConfig } from 'unconfig'

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
