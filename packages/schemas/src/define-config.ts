import { parseZodSchema } from '@agentic/platform-core'

import {
  type AgenticProjectConfig,
  type AgenticProjectConfigInput,
  agenticProjectConfigSchema
} from './agentic-project-config-schema'

/**
 * This method allows Agentic projects to define their configs in a type-safe
 * way from `agentic.config.ts` files.
 *
 * It parses the given input config and performs basic validation.
 */
export function defineConfig(
  config: AgenticProjectConfigInput
): AgenticProjectConfig {
  return parseZodSchema(agenticProjectConfigSchema, config)
}
