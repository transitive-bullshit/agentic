import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { compress } from 'hono/compress'
import { cors } from 'hono/cors'

import { apiV1 } from '@/api-v1'
import { env } from '@/lib/env'
import * as middleware from '@/lib/middleware'

export const app = new Hono()

app.use(compress())
app.use(middleware.responseTime)
app.use(middleware.errorHandler)
app.use(cors())

app.route('/v1', apiV1)

serve({
  fetch: app.fetch,
  port: env.PORT
})
