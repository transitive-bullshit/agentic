import 'dotenv/config'

import { parseZodSchema } from '@agentic/platform-core'
import { z } from 'zod'

import { logLevelsSchema } from './logger'

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  DATABASE_URL: z.string().url(),

  BETTER_AUTH_SECRET: z.string().nonempty(),
  BETTER_AUTH_URL: z.string().url(),

  JWT_SECRET: z.string().nonempty(),
  SENTRY_DSN: z.string().url(),
  PORT: z.number().default(3000),
  LOG_LEVEL: logLevelsSchema.default('info'),

  STRIPE_SECRET_KEY: z.string().nonempty(),
  STRIPE_WEBHOOK_SECRET: z.string().nonempty(),

  GITHUB_CLIENT_ID: z.string().nonempty(),
  GITHUB_CLIENT_SECRET: z.string().nonempty()
})
export type Env = z.infer<typeof envSchema>

// eslint-disable-next-line no-process-env
export const env = parseZodSchema(envSchema, process.env, {
  error: 'Invalid environment variables'
})

export const isDev = env.NODE_ENV === 'development'
export const isProd = env.NODE_ENV === 'production'
export const isBrowser = (globalThis as any).window !== undefined

export const isStripeLive = env.STRIPE_SECRET_KEY.startsWith('sk_live_')
