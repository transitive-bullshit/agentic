import type { Context } from './types'

export async function enforceRateLimit(
  ctx: Context,
  {}: {
    id: string
    interval: number
    maxPerInterval: number
    method: string
    pathname: string
  }
) {}
