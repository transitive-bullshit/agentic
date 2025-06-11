import {
  getRateLimitHeaders,
  type RateLimitResult
} from '@agentic/platform-core'

export function applyHeaders({
  res,
  headers
}: {
  res: Response
  headers?: Record<string, string>
}) {
  if (!headers) return

  for (const [key, value] of Object.entries(headers)) {
    res.headers.set(key, value)
  }
}

export function applyRateLimitHeaders({
  res,
  rateLimitResult
}: {
  res: Response
  rateLimitResult?: RateLimitResult
}) {
  const rateLimitHeaders = getRateLimitHeaders(rateLimitResult)

  applyHeaders({ res, headers: rateLimitHeaders })
}
