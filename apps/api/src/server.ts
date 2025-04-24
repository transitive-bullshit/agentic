import '@/lib/instrument'

import { serve } from '@hono/node-server'
import { sentry } from '@hono/sentry'
import { Hono } from 'hono'
import { compress } from 'hono/compress'
import { cors } from 'hono/cors'

import { apiV1 } from '@/api-v1'
import { env } from '@/lib/env'
import * as middleware from '@/lib/middleware'

import { initExitHooks } from './lib/exit-hooks'

export const app = new Hono()

app.use(sentry())
app.use(compress())
app.use(middleware.accessLogger)
app.use(middleware.responseTime)
app.use(middleware.errorHandler)
app.use(cors())

app.route('/v1', apiV1)

const server = serve({
  fetch: app.fetch,
  port: env.PORT
})

initExitHooks({ server })
