import 'dotenv/config'

import { z } from 'zod'

export const envSchema = z.object({
  PORT: z.string().default('8080').transform(Number)
})

export type Env = z.infer<typeof envSchema>

// eslint-disable-next-line no-process-env
export const env = envSchema.parse(process.env)
