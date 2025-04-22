import { createMiddleware } from 'hono/factory'

export const authenticate = createMiddleware(async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.url}`)
  await next()
})
