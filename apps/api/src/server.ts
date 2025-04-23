import { promisify } from 'node:util'

import { serve } from '@hono/node-server'
import { asyncExitHook } from 'exit-hook'
import { Hono } from 'hono'
import { compress } from 'hono/compress'
import { cors } from 'hono/cors'
import restoreCursor from 'restore-cursor'

import { apiV1 } from '@/api-v1'
import { env } from '@/lib/env'
import * as middleware from '@/lib/middleware'

restoreCursor()

export const app = new Hono()

app.use(compress())
app.use(middleware.responseTime)
app.use(middleware.errorHandler)
app.use(cors())

app.route('/v1', apiV1)

const server = serve({
  fetch: app.fetch,
  port: env.PORT
})

asyncExitHook(
  async () => {
    await promisify(server.close)()
  },
  {
    wait: 10_000
  }
)
