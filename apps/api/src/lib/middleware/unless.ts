import type { MiddlewareHandler } from 'hono'

export const unless =
  (mw: MiddlewareHandler, ...excluded: string[]): MiddlewareHandler =>
  async (c, next) => {
    if (excluded.includes(c.req.path)) return next()
    return mw(c, next)
  }
