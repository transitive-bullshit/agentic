import 'dotenv/config'

import type { Simplify } from 'type-fest'
import { parseZodSchema } from '@agentic/platform-core'
import { z } from 'zod'

import { logLevelsSchema } from './logger'

export const envSchema = z
  .object({
    ENVIRONMENT: z
      .enum(['development', 'test', 'production'])
      .default('development'),

    SERVICE: z.enum(['api', 'gateway']),

    LOG_LEVEL: logLevelsSchema.default('info'),

    SENTRY_DSN: z.string().url().optional()
  })
  .strip()

export function parseEnv(inputEnv: unknown) {
  const env = parseZodSchema(envSchema, inputEnv, {
    error: 'Invalid environment variables'
  })

  const isDev = env.ENVIRONMENT === 'development'
  const isTest = env.ENVIRONMENT === 'test'
  const isProd = env.ENVIRONMENT === 'production'
  const isBrowser = (globalThis as any).window !== undefined

  if (isProd && !env.SENTRY_DSN) {
    throw new Error(
      'Internal error: missing required "SENTRY_DSN" environment variable in production'
    )
  }

  return {
    ...env,
    isDev,
    isTest,
    isProd,
    isBrowser
  }
}

export type Env = Simplify<ReturnType<typeof parseEnv>>
