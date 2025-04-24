import 'dotenv/config'

import { z } from 'zod'

import { parseZodSchema } from './utils'

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string(),
  PORT: z.number().default(3000),
  SENTRY_DSN: z.string().url()
})
export type Env = z.infer<typeof envSchema>

// eslint-disable-next-line no-process-env
export const env = parseZodSchema(envSchema, process.env, {
  error: 'Invalid environment variables'
})

export const isDev = env.NODE_ENV === 'development'
export const isProd = env.NODE_ENV === 'production'
export const isBrowser = (globalThis as any).window !== undefined
