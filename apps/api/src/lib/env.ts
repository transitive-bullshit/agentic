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

    AGENTIC_WEB_BASE_URL: z.string().url(),
    AGENTIC_GATEWAY_BASE_URL: z.string().url(),
    AGENTIC_STORAGE_BASE_URL: z
      .string()
      .url()
      .optional()
      .default('https://storage.agentic.so'),

    JWT_SECRET: z.string().nonempty(),

    PORT: z.coerce.number().default(3001),

    STRIPE_SECRET_KEY: z.string().nonempty(),
    STRIPE_WEBHOOK_SECRET: z.string().nonempty(),

    GITHUB_CLIENT_ID: z.string().nonempty(),
    GITHUB_CLIENT_SECRET: z.string().nonempty(),

    RESEND_API_KEY: z.string().nonempty(),

    // Used to make admin API calls from the API gateway
    AGENTIC_ADMIN_API_KEY: z.string().nonempty(),

    // Used to simplify recreating the demo `@agentic/search` project during
    // development while we're frequently resetting the database
    AGENTIC_SEARCH_PROXY_SECRET: z.string().nonempty(),

    S3_BUCKET: z.string().nonempty().optional().default('agentic'),
    S3_REGION: z.string().nonempty().optional().default('auto'),
    S3_ENDPOINT: z.string().nonempty().url(),
    S3_ACCESS_KEY_ID: z.string().nonempty(),
    S3_ACCESS_KEY_SECRET: z.string().nonempty()
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
  const apiBaseUrl = baseEnv.isProd
    ? 'https://api.agentic.so'
    : 'http://localhost:3001'

  return {
    ...baseEnv,
    ...env,
    isStripeLive,
    apiBaseUrl
  }
}

export type Env = Simplify<ReturnType<typeof parseEnv>>

// eslint-disable-next-line no-process-env
export const env = parseEnv(process.env)
