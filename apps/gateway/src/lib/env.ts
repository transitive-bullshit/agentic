import { z } from 'zod'

export const envSchema = z.object({
  ENVIRONMENT: z.enum(['development', 'production']).default('development'),

  AGENTIC_API_BASE_URL: z.string().url(),
  AGENTIC_API_KEY: z.string().nonempty(),

  DO_RATE_LIMITER: z.custom<DurableObjectNamespace>(
    (ns) => ns && typeof ns === 'object'
  )
})
export type AgenticEnv = z.infer<typeof envSchema>
