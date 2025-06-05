import type { MiddlewareHandler } from 'hono'

/**
 * Creates a hono middleware that only runs if the request path is not in the
 * excluded paths.
 */
export function unless(
  middleware: MiddlewareHandler,
  ...excluded: string[]
): MiddlewareHandler {
  const excludedPaths = new Set(excluded)

  return async (c, next) => {
    if (excludedPaths.has(c.req.path)) {
      return next()
    } else {
      return middleware(c, next)
    }
  }
}
