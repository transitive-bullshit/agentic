import { Hono } from 'hono'

import * as middleware from '@/lib/middleware'

export const app = new Hono()

const pri = new Hono()
// const pub = new Hono()

app.route('/', pri)
app.use('*', middleware.authenticate)
