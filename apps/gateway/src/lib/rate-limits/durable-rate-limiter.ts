import type { SetOptional } from 'type-fest'
import * as Sentry from '@sentry/cloudflare'
import { DurableObject } from 'cloudflare:workers'

import type { RawEnv } from '../env'
import type { RateLimitState } from '../types'

const initialState: SetOptional<RateLimitState, 'resetTimeMs'> = {
  current: 0
}

export class DurableRateLimiterBase extends DurableObject<RawEnv> {
  async update({
    intervalMs,
    cost = 1
  }: {
    intervalMs: number
    cost?: number
  }): Promise<RateLimitState> {
    const existingState = await this.ctx.storage.get<RateLimitState>('value')
    const currentAlarm = await this.ctx.storage.getAlarm()

    const now = Date.now()
    const updatedResetTimeMs = now + intervalMs

    // Update the payload
    const state =
      existingState && currentAlarm && currentAlarm > now
        ? existingState
        : {
            current: 0,
            resetTimeMs: updatedResetTimeMs
          }
    state.current += cost

    // Update the alarm
    if (!currentAlarm || currentAlarm <= now) {
      await this.ctx.storage.setAlarm(state.resetTimeMs)
    }

    await this.ctx.storage.put('value', state)

    // const updatedState = await this.ctx.storage.get<RateLimitState>('value')
    // console.log('DurableRateLimiter.update', this.ctx.id.toString(), {
    //   existingState,
    //   state,
    //   updatedState,
    //   now,
    //   intervalMs,
    //   updatedResetTimeMs,
    //   currentAlarm
    // })

    return state
  }

  async reset() {
    // console.log('reset rate-limit', this.ctx.id)
    await this.ctx.storage.put('value', initialState)
  }

  override async alarm() {
    await this.reset()
  }
}

export const DurableRateLimiter = Sentry.instrumentDurableObjectWithSentry(
  (env: RawEnv) => ({
    dsn: env.SENTRY_DSN,
    environment: env.ENVIRONMENT,
    integrations: [Sentry.extraErrorDataIntegration()]
  }),
  DurableRateLimiterBase
)
