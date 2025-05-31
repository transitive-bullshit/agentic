import type {
  AgenticProjectConfig,
  AgenticProjectConfigInput
} from '@agentic/platform-types'

import { parseAgenticProjectConfig } from './parse-agentic-project-config'

/**
 * This method allows Agentic projects to define their configs in a type-safe
 * way from `agentic.config.ts` files.
 *
 * It parses the given input config and performs basic validation.
 */
export function defineConfig(
  config: AgenticProjectConfigInput
): AgenticProjectConfig {
  return parseAgenticProjectConfig(config)
}
