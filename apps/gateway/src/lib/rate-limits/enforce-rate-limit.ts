import { assert } from '@agentic/platform-core'

import type { RawEnv } from '../env'
import type {
  RateLimitCache,
  RateLimitResult,
  RateLimitState,
  WaitUntil
} from '../types'
import type { DurableRateLimiterBase } from './durable-rate-limiter'

/**
 * This maps persists across worker executions and is used for caching active
 * rate limits. It's purely a performance optimization and is not used as a
 * source of truth.
 */
const globalRateLimitCache: RateLimitCache = new Map()

export async function enforceRateLimit({
  id,
  interval,
  limit,
  cost = 1,
  async: _async = true,
  env,
  cache = globalRateLimitCache,
  waitUntil
}: {
  /**
   * The identifier used to uniquely track this rate limit.
   */
  id: string

  /**
   * Interval in seconds over which the rate limit is enforced.
   */
  interval: number

  /**
   * Maximum number of requests that can be made per interval.
   */
  limit: number

  /**
   * The cost of the request.
   *
   * @default 1
   */
  cost?: number

  /**
   * Whether to enforce the rate limit synchronously or asynchronously.
   *
   * @default true (asynchronous)
   */
  async?: boolean

  env: RawEnv
  cache?: RateLimitCache
  waitUntil: WaitUntil
}): Promise<RateLimitResult> {
  assert(id, 400, 'Unauthenticated requests must have a valid IP address')

  const async = false

  const intervalMs = interval * 1000
  const now = Date.now()

  const initialRateLimitState = cache.get(id) ?? {
    current: 0,
    resetTimeMs: now + intervalMs
  }
  let rateLimitState = initialRateLimitState

  function updateCache(info: RateLimitState) {
    cache.set(id, info)
    rateLimitState = info
  }

  /**
   * Short-circuit check for active rate limits that are currently exceeded.
   *
   * This might not happen too often, but in extreme cases the cache should hit
   * and we can skip the request to the durable object entirely, which speeds
   * everything up and is cheaper for us.
   */
  if (rateLimitState.current > limit && now <= rateLimitState.resetTimeMs) {
    return {
      id,
      passed: false,
      current: rateLimitState.current,
      limit,
      resetTimeMs: rateLimitState.resetTimeMs,
      intervalMs,
      remaining: Math.max(0, limit - rateLimitState.current)
    }
  }

  const durableRateLimiterId = env.DO_RATE_LIMITER.idFromName(id)
  const durableRateLimiter = env.DO_RATE_LIMITER.get(
    durableRateLimiterId
  ) as DurableObjectStub<DurableRateLimiterBase>

  const updatedRateLimitStateP = durableRateLimiter.update({ cost, intervalMs })

  if (async) {
    waitUntil(
      updatedRateLimitStateP
        .then((updatedRateLimitState: RateLimitState) => {
          updateCache(updatedRateLimitState)
        })
        .catch((err: Error) => {
          // eslint-disable-next-line no-console
          console.error(
            `error updating rate limit for id "${id}": ${err.message}`
          )
        })
    )

    rateLimitState.current += cost
    updateCache(rateLimitState)
  } else {
    const updatedRateLimitState = await updatedRateLimitStateP
    updateCache(updatedRateLimitState)
  }

  // console.log('rateLimit', {
  //   id,
  //   initial: initialRateLimitState,
  //   current: rateLimitState,
  //   cost
  // })

  return {
    id,
    passed: rateLimitState.current <= limit,
    current: rateLimitState.current,
    limit,
    resetTimeMs: rateLimitState.resetTimeMs,
    intervalMs,
    remaining: Math.max(0, limit - rateLimitState.current)
  }
}
