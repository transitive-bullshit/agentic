import { z } from 'zod'

export const envSchema = z.object({
  SERPER_API_KEY: z.string().nonempty()
})

export type Env = z.infer<typeof envSchema>

export function parseEnv(inputEnv: Record<string, unknown>): Env {
  return envSchema.parse(inputEnv)
}
