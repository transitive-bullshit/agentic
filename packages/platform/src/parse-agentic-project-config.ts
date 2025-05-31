import type { z, ZodTypeDef } from 'zod'
import { parseZodSchema } from '@agentic/platform-core'
import {
  type AgenticProjectConfig,
  agenticProjectConfigSchema
} from '@agentic/platform-types'

/**
 * @internal
 */
export function parseAgenticProjectConfig(
  inputConfig: unknown,
  { strip = false, strict = false }: { strip?: boolean; strict?: boolean } = {}
): AgenticProjectConfig {
  // NOTE: The extra typing and cast here are necessary because we're
  // overriding the default zod types for some fields (e.g. `pricingPlans`) in
  // order to get stricter TypeScript types than what zod v3 allows (nested
  // discrimianted unions). This should be removed once we upgrade to zod v4.
  return parseZodSchema<
    z.infer<typeof agenticProjectConfigSchema>,
    ZodTypeDef,
    z.input<typeof agenticProjectConfigSchema>
  >(
    strip
      ? agenticProjectConfigSchema.strip()
      : strict
        ? agenticProjectConfigSchema.strict()
        : agenticProjectConfigSchema,
    inputConfig
  ) as AgenticProjectConfig
}
