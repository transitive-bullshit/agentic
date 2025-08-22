import Stripe from 'stripe'

import { env } from '@/lib/env'

const version = '2025-06-30.basil'

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: version,
  appInfo: {
    name: 'transitive-bullshit/agentic',
    version,
    url: 'https://agentic.so'
  }
})
