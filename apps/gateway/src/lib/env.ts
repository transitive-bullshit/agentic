import type { Simplify } from 'type-fest'
import { parseZodSchema } from '@agentic/platform-core'
import {
  envSchema as baseEnvSchema,
  parseEnv as parseBaseEnv
} from '@agentic/platform-hono'
import { z } from 'zod'

import type { DurableMcpClient } from './durable-mcp-client'
import type { DurableRateLimiter } from './durable-rate-limiter'

export const envSchema = baseEnvSchema
  .extend({
    AGENTIC_API_BASE_URL: z.string().url(),
    AGENTIC_API_KEY: z.string().nonempty(),

    DO_RATE_LIMITER: z.custom<DurableObjectNamespace<DurableRateLimiter>>(
      (ns) => isDurableObjectNamespace(ns)
    ),

    DO_MCP_SERVER: z.custom<DurableObjectNamespace>((ns) =>
      isDurableObjectNamespace(ns)
    ),

    DO_MCP_CLIENT: z.custom<DurableObjectNamespace<DurableMcpClient>>((ns) =>
      isDurableObjectNamespace(ns)
    )
  })
  .strip()
export type RawEnv = z.infer<typeof envSchema>
export type Env = Simplify<ReturnType<typeof parseEnv>>

export function isDurableObjectNamespace(
  namespace: unknown
): namespace is DurableObjectNamespace {
  return (
    typeof namespace === 'object' &&
    namespace !== null &&
    'newUniqueId' in namespace &&
    typeof namespace.newUniqueId === 'function' &&
    'idFromName' in namespace &&
    typeof namespace.idFromName === 'function'
  )
}

export function parseEnv(inputEnv: Record<string, unknown>) {
  const baseEnv = parseBaseEnv({
    SERVICE: 'gateway',
    ...inputEnv
  })

  const env = parseZodSchema(
    envSchema,
    { ...inputEnv, ...baseEnv },
    {
      error: 'Invalid environment variables'
    }
  )

  return {
    ...baseEnv,
    ...env
  }
}
