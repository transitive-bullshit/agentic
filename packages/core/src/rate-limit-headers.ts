import type { RateLimitResult } from './types'

/**
 * @see https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers-06
 */
export function getRateLimitHeaders(
  rateLimitResult?: RateLimitResult
): Record<string, string> | undefined {
  const headers: Record<string, string> = {}
  if (!rateLimitResult) {
    return undefined
  }

  const { id, limit, remaining, resetTimeMs, intervalMs } = rateLimitResult
  const intervalSeconds = Math.ceil(intervalMs / 1000)
  const retryAfterSeconds = Math.max(
    0,
    Math.ceil((resetTimeMs - Date.now()) / 1000)
  )

  headers['RateLimit-Policy'] = `${limit};w=${intervalSeconds}`
  headers['RateLimit-Limit'] = limit.toString()
  headers['RateLimit-Remaining'] = remaining.toString()
  headers['Retry-After'] = retryAfterSeconds.toString()
  headers['X-RateLimit-Id'] = id

  return headers
}

export function applyRateLimitHeaders(
  rateLimitResult: RateLimitResult,
  res: Response
) {
  const rateLimitHeaders = getRateLimitHeaders(rateLimitResult)
  if (!rateLimitHeaders) return

  for (const [key, value] of Object.entries(rateLimitHeaders)) {
    res.headers.set(key, value)
  }
}
