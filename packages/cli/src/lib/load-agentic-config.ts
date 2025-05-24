import { parseZodSchema } from '@agentic/platform-core'
import { agenticProjectSchema } from '@agentic/platform-schemas'
import { loadConfig } from 'unconfig'

export async function loadAgenticConfig({ cwd }: { cwd?: string }) {
  const { config } = await loadConfig({
    cwd,
    sources: [
      {
        files: 'agentic.config',
        extensions: ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs', 'json']
      }
    ]
  })

  return parseZodSchema(agenticProjectSchema, config)
}
