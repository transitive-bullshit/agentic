import 'dotenv/config'

import { z } from 'zod'

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string()
})

// eslint-disable-next-line no-process-env
export const env = envSchema.parse(process.env)

export const isProd = env.NODE_ENV === 'production'
