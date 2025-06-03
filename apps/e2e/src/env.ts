import 'dotenv/config'

import { parseZodSchema } from '@agentic/platform-core'
import { z } from 'zod'

// TODO: derive AGENTIC_API_BASE_URL and AGENTIC_GATEWAY_BASE_URL based on
// environment.

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  AGENTIC_API_BASE_URL: z.string().url().optional(),
  AGENTIC_API_ACCESS_TOKEN: z.string().nonempty(),

  AGENTIC_GATEWAY_BASE_URL: z
    .string()
    .url()
    .optional()
    .default('http://localhost:8787')
})

// eslint-disable-next-line no-process-env
export const env = parseZodSchema(envSchema, process.env, {
  error: 'Invalid environment variables'
})

export const isDev = env.NODE_ENV === 'development'
export const isProd = env.NODE_ENV === 'production'
