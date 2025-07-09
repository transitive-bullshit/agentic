import Stripe from 'stripe'

import type { RawEnv } from '../env'

export function createStripe(env: RawEnv): Stripe {
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-06-30.basil'
  })
}
