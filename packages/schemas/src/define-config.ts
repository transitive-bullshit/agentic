import { parseZodSchema } from '@agentic/platform-core'

import {
  type AgenticProjectConfigInput,
  type AgenticProjectConfigOutput,
  agenticProjectConfigSchema
} from './agentic-project-config-schema'

export function defineConfig(
  config: AgenticProjectConfigInput
): AgenticProjectConfigOutput {
  return parseZodSchema(agenticProjectConfigSchema, config)
}
