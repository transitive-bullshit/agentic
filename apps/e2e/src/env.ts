import 'dotenv/config'

import { parseZodSchema } from '@agentic/platform-core'
import { z } from 'zod'

// TODO: derive AGENTIC_API_BASE_URL and AGENTIC_GATEWAY_BASE_URL based on
// environment.
// TODO: use `@agentic/platform-hono` base env like other services

export const envSchema = z.object({
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
