import { parseZodSchema } from '@agentic/platform-core'
import {
  type AgenticProjectConfig,
  agenticProjectConfigSchema,
  type ResolvedAgenticProjectConfig,
  resolvedAgenticProjectConfigSchema
} from '@agentic/platform-types'

// NOTE: The extra typing and casts here are necessary because we're overriding
// the default zod types for some fields (e.g. `pricingPlans`) in order to get
// stricter TypeScript types than what zod v3 allows (nested discrimianted
// unions). We should consider removing these once we upgrade to zod v4.

/**
 * @internal
 */
export function parseAgenticProjectConfig(
  inputConfig: unknown,
  { strip = false, strict = false }: { strip?: boolean; strict?: boolean } = {}
): AgenticProjectConfig {
  return parseZodSchema(
    strip
      ? agenticProjectConfigSchema.strip()
      : strict
        ? agenticProjectConfigSchema.strict()
        : agenticProjectConfigSchema,
    inputConfig
  ) as AgenticProjectConfig
}

/**
 * @internal
 */
export function parseResolvedAgenticProjectConfig(
  inputConfig: unknown,
  { strip = false, strict = false }: { strip?: boolean; strict?: boolean } = {}
): ResolvedAgenticProjectConfig {
  return parseZodSchema(
    strip
      ? resolvedAgenticProjectConfigSchema.strip()
      : strict
        ? resolvedAgenticProjectConfigSchema.strict()
        : resolvedAgenticProjectConfigSchema,
    inputConfig
  ) as ResolvedAgenticProjectConfig
}
