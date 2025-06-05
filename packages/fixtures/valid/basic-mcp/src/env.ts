import 'dotenv/config'

import { z } from 'zod'

export const envSchema = z.object({
  PORT: z.number().default(8080)
})

export type Env = z.infer<typeof envSchema>

// eslint-disable-next-line no-process-env
export const env = envSchema.parse(process.env)
