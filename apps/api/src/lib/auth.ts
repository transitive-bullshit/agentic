import { validators } from '@agentic/platform-validators'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { username } from 'better-auth/plugins'

import { createIdForModel, db } from '@/db'

import { env } from './env'

export const auth = betterAuth({
  adapter: drizzleAdapter(db, {
    provider: 'pg'
  }),
  emailAndPassword: {
    enabled: true
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET
    }
  },
  user: {
    modelName: 'users',
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
        input: false // don't allow user to set role
      },
      // username: {
      //   type: 'string',
      //   required: false
      // },
      stripeCustomerId: {
        type: 'string',
        required: false
      }
    }
  },
  session: {
    modelName: 'sessions'
  },
  account: {
    modelName: 'accounts'
  },
  verification: {
    modelName: 'verifications'
  },
  advanced: {
    database: {
      generateId: ({ model }) => createIdForModel(model as any)
    }
  },
  plugins: [
    username({
      usernameValidator: validators.username
    })
  ]
})
