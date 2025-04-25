import { OpenAPIHono } from '@hono/zod-openapi'

import type { AuthenticatedEnv } from '@/lib/types'
import * as middleware from '@/lib/middleware'

import { registerHealthCheck } from './health-check'
import { registerV1UsersGetUser } from './users/get-user'

export const apiV1 = new OpenAPIHono()

const pub = new OpenAPIHono()
const pri = new OpenAPIHono<AuthenticatedEnv>()

registerHealthCheck(pub)

// users
registerV1UsersGetUser(pri)

apiV1.route('/', pub)
apiV1.use(middleware.authenticate)
apiV1.use(middleware.team)
apiV1.use(middleware.me)
apiV1.route('/', pri)
