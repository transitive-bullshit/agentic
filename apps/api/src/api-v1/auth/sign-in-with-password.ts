import type { DefaultHonoEnv } from '@agentic/platform-hono'
import type { Context } from 'hono'
import { assert, parseZodSchema } from '@agentic/platform-core'
import { isValidPassword } from '@agentic/platform-validators'
import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'
import { compare } from 'bcryptjs'

import { and, db, eq, schema } from '@/db'
import { createAuthToken } from '@/lib/auth/create-auth-token'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { authSessionResponseSchema } from './schemas'

const route = createRoute({
  description: 'Signs in with email and password.',
  tags: ['auth'],
  operationId: 'signInWithPassword',
  method: 'post',
  path: 'auth/password/signin',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            email: z.string().email(),
            password: z.string().refine((password) => isValidPassword(password))
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: 'An auth session',
      content: {
        'application/json': {
          schema: authSessionResponseSchema
        }
      }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

export function registerV1AuthSignInWithPassword(
  app: OpenAPIHono<DefaultHonoEnv>
) {
  return app.openapi(route, trySignIn)
}

export async function trySignIn(
  c: Context<
    DefaultHonoEnv,
    'auth/password/signin',
    {
      in: {
        json: {
          password: string
          email: string
        }
      }
      out: {
        json: {
          password: string
          email: string
        }
      }
    }
  >
) {
  const { email, password } = c.req.valid('json')

  const user = await db.query.users.findFirst({
    where: eq(schema.users.email, email)
  })
  assert(user, 404, `User not found "${email}"`)

  const account = await db.query.accounts.findFirst({
    where: and(
      eq(schema.accounts.userId, user.id),
      eq(schema.accounts.provider, 'password')
    )
  })
  assert(account?.password, 404, `User "${email}" does not have a password set`)
  assert(compare(password, account.password), 403, 'Authentication error')

  const token = await createAuthToken(user)
  return c.json(parseZodSchema(authSessionResponseSchema, { token, user }))
}
