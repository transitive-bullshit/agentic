import type { DefaultHonoEnv } from '@agentic/platform-hono'
import { parseZodSchema } from '@agentic/platform-core'
import { isValidPassword } from '@agentic/platform-validators'
import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'
import { genSalt, hash } from 'bcryptjs'

import { usernameSchema } from '@/db'
import { createAuthToken } from '@/lib/auth/create-auth-token'
import { upsertOrLinkUserAccount } from '@/lib/auth/upsert-or-link-user-account'
import { ensureUniqueNamespace } from '@/lib/ensure-unique-namespace'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'

import { authSessionResponseSchema } from './schemas'
import { trySignIn } from './sign-in-with-password'

const route = createRoute({
  description: 'Signs up for a new account with email and password.',
  tags: ['auth'],
  operationId: 'signUpWithPassword',
  method: 'post',
  path: 'auth/password/signup',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            username: usernameSchema,
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

export function registerV1SignUpWithPassword(app: OpenAPIHono<DefaultHonoEnv>) {
  return app.openapi(route, async (c) => {
    try {
      // try signing in to see if the user already exists
      return await trySignIn(c)
    } catch {
      // Ignore errors
    }

    const { username, email, password } = c.req.valid('json')
    await ensureUniqueNamespace(username, { label: 'username' })

    const salt = await genSalt()
    const hashedPassword = await hash(password, salt)

    // TODO: fail if username is taken
    const user = await upsertOrLinkUserAccount({
      partialAccount: {
        provider: 'password',
        accountId: email,
        password: hashedPassword
      },
      partialUser: {
        username,
        email
      }
    })

    const token = await createAuthToken(user)
    return c.json(parseZodSchema(authSessionResponseSchema, { token, user }))
  })
}
