import { parseZodSchema } from '@agentic/platform-core'

import {
  type AgenticProjectConfig,
  type AgenticProjectConfigInput,
  agenticProjectConfigSchema
} from './agentic-project-config-schema'

export function defineConfig(
  config: AgenticProjectConfigInput
): AgenticProjectConfig {
  return parseZodSchema(agenticProjectConfigSchema, config)
}
