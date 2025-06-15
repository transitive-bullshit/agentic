import type { Simplify } from 'type-fest'
import { parseZodSchema } from '@agentic/platform-core'
import {
  envSchema as baseEnvSchema,
  parseEnv as parseBaseEnv
} from '@agentic/platform-hono'
import { z } from 'zod'

export const envSchema = baseEnvSchema
  .extend({
    DATABASE_URL: z.string().url(),
    WEB_AUTH_BASE_URL: z.string().url(),

    PORT: z.number().default(3001),

    STRIPE_SECRET_KEY: z.string().nonempty(),
    STRIPE_WEBHOOK_SECRET: z.string().nonempty(),

    GITHUB_CLIENT_ID: z.string().nonempty(),
    GITHUB_CLIENT_SECRET: z.string().nonempty(),

    AGENTIC_ADMIN_API_KEY: z.string().nonempty(),

    RESEND_API_KEY: z.string().nonempty()
  })
  .strip()
export type RawEnv = z.infer<typeof envSchema>

export function parseEnv(inputEnv: Record<string, unknown>) {
  const baseEnv = parseBaseEnv({
    SERVICE: 'api',
    ...inputEnv
  })

  const env = parseZodSchema(
    envSchema,
    { ...inputEnv, ...baseEnv },
    {
      error: 'Invalid environment variables'
    }
  )

  const isStripeLive = env.STRIPE_SECRET_KEY.startsWith('sk_live_')

  return {
    ...baseEnv,
    ...env,
    isStripeLive
  }
}

export type Env = Simplify<ReturnType<typeof parseEnv>>

// eslint-disable-next-line no-process-env
export const env = parseEnv(process.env)
