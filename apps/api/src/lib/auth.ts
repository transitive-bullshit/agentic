import { validators } from '@agentic/platform-validators'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { username } from 'better-auth/plugins'

import { createIdForModel, db, type ModelType } from '@/db'

import { env } from './env'

export const auth = betterAuth({
  appName: 'Agentic',
  basePath: '/v1/auth',
  database: drizzleAdapter(db, {
    provider: 'pg'
  }),
  trustedOrigins: [
    // Used for an oauth redirect when authenticating via the CLI
    'http://localhost:6013'
  ],
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
    modelName: 'sessions',
    cookieCache: {
      enabled: true,
      maxAge: 10 * 60 // 10 minutes in seconds
    }
  },
  account: {
    modelName: 'accounts',
    accountLinking: {
      enabled: true,
      trustedProviders: ['github']
    }
  },
  verification: {
    modelName: 'verifications'
  },
  advanced: {
    database: {
      generateId: ({ model }) => createIdForModel(model as ModelType)
    }
  },
  plugins: [
    username({
      usernameValidator: validators.username
    })
  ]
})
