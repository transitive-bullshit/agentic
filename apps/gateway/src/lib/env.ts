import type { Simplify } from 'type-fest'
import { parseZodSchema } from '@agentic/platform-core'
import {
  envSchema as baseEnvSchema,
  parseEnv as parseBaseEnv
} from '@agentic/platform-hono'
import { z } from 'zod'

export const envSchema = baseEnvSchema
  .extend({
    AGENTIC_API_BASE_URL: z.string().url(),
    AGENTIC_API_KEY: z.string().nonempty(),

    DO_RATE_LIMITER: z.custom<DurableObjectNamespace>(
      (ns) => ns && typeof ns === 'object'
    )
  })
  .strip()
export type RawEnv = z.infer<typeof envSchema>
export type Env = Simplify<ReturnType<typeof parseEnv>>

export function parseEnv(inputEnv: Record<string, unknown>) {
  const baseEnv = parseBaseEnv({
    SERVICE: 'gateway',
    ...inputEnv
  })

  const env = parseZodSchema(
    envSchema,
    { ...inputEnv, ...baseEnv },
    {
      error: 'Invalid environment variables'
    }
  )

  return {
    ...baseEnv,
    ...env
  }
}
