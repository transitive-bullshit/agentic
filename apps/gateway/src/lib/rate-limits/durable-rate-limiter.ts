import type { SetOptional } from 'type-fest'
import { DurableObject } from 'cloudflare:workers'

import type { RateLimitState } from '../types'

const initialState: SetOptional<RateLimitState, 'resetTimeMs'> = {
  current: 0
}

export class DurableRateLimiter extends DurableObject {
  async update({
    intervalMs,
    cost = 1
  }: {
    intervalMs: number
    cost?: number
  }): Promise<RateLimitState> {
    const existingState =
      (await this.ctx.storage.get<RateLimitState>('value')) || initialState

    // Update the payload
    const resetTimeMs = existingState.resetTimeMs ?? Date.now() + intervalMs

    const state: RateLimitState = {
      current: existingState.current + cost,
      resetTimeMs
    }

    // Update the alarm
    const currentAlarm = await this.ctx.storage.getAlarm()
    if (currentAlarm == null) {
      await this.ctx.storage.setAlarm(resetTimeMs)
    }

    await this.ctx.storage.put('value', state)
    return state
  }

  async reset() {
    await this.ctx.storage.put('value', initialState)
  }

  override async alarm() {
    await this.reset()
  }
}
