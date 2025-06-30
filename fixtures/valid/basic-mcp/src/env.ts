import { z } from 'zod'

export const envSchema = z.object({
  PORT: z.string().default('8080').transform(Number)
})

export type Env = z.infer<typeof envSchema>

export const env = envSchema.parse(process.env)
