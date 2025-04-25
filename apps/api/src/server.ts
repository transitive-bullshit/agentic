import '@/lib/instrument'

import { serve } from '@hono/node-server'
import { sentry } from '@hono/sentry'
import { OpenAPIHono } from '@hono/zod-openapi'
import { compress } from 'hono/compress'
import { cors } from 'hono/cors'

import { apiV1 } from '@/api-v1'
import { env } from '@/lib/env'
import * as middleware from '@/lib/middleware'

import { initExitHooks } from './lib/exit-hooks'

export const app = new OpenAPIHono()

app.use(sentry())
app.use(compress())
// app.use(middleware.accessLogger)
app.use(middleware.responseTime)
app.use(middleware.errorHandler)
app.use(cors())

app.route('/v1', apiV1)

app.doc31('/docs', {
  openapi: '3.1.0',
  info: { title: 'Agentic', version: '1.0.0' }
})

const server = serve({
  fetch: app.fetch,
  port: env.PORT
})
console.log(`Server running on port ${env.PORT}`)

initExitHooks({ server })
