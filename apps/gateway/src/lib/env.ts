import type {
  AnalyticsEngineDataset,
  DurableObjectNamespace
} from '@cloudflare/workers-types'
import type { Simplify } from 'type-fest'
import { parseZodSchema } from '@agentic/platform-core'
import {
  envSchema as baseEnvSchema,
  parseEnv as parseBaseEnv
} from '@agentic/platform-hono'
import { z } from 'zod'

export const envSchema = baseEnvSchema
  .extend({
    AGENTIC_API_BASE_URL: z.string().url(),
    AGENTIC_API_KEY: z.string().nonempty(),

    STRIPE_SECRET_KEY: z.string().nonempty(),

    DO_RATE_LIMITER: z.custom<DurableObjectNamespace>((ns) =>
      isDurableObjectNamespace(ns)
    ),

    DO_MCP_SERVER: z.custom<DurableObjectNamespace>((ns) =>
      isDurableObjectNamespace(ns)
    ),

    DO_MCP_CLIENT: z.custom<DurableObjectNamespace>((ns) =>
      isDurableObjectNamespace(ns)
    ),

    AE_USAGE_DATASET: z.custom<AnalyticsEngineDataset>((ae) =>
      isAnalyticsEngineDataset(ae)
    )
  })
  .strip()
export type RawEnv = z.infer<typeof envSchema>

export function isDurableObjectNamespace(
  namespace: unknown
): namespace is DurableObjectNamespace {
  return (
    !!namespace &&
    typeof namespace === 'object' &&
    'newUniqueId' in namespace &&
    typeof namespace.newUniqueId === 'function' &&
    'idFromName' in namespace &&
    typeof namespace.idFromName === 'function'
  )
}

function isAnalyticsEngineDataset(ae: unknown): ae is AnalyticsEngineDataset {
  return !!ae && typeof ae === 'object' && 'writeDataPoint' in ae
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

  const isStripeLive = env.STRIPE_SECRET_KEY.startsWith('sk_live_')

  return {
    ...baseEnv,
    ...env,
    isStripeLive
  }
}

export type Env = Simplify<ReturnType<typeof parseEnv>>
