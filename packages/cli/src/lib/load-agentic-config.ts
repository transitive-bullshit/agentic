import {
  type AgenticProjectConfig,
  validateAgenticProjectConfig
} from '@agentic/platform-schemas'
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
