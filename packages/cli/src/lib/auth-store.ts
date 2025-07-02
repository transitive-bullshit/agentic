import type { AuthSession } from '@agentic/platform-types'
import { assert } from '@agentic/platform-core'
import Conf from 'conf'

import { agenticApiBaseUrl } from './env'

const keyAuthSession = `authSession:${agenticApiBaseUrl}`

export const AuthStore = {
  store: new Conf<{
    [keyAuthSession]: AuthSession
  }>({ projectName: 'agentic' }),

  isAuthenticated() {
    return this.store.has(keyAuthSession)
  },

  requireAuth() {
    assert(
      this.isAuthenticated(),
      'This command requires authentication. Please login first.'
    )
  },

  tryGetAuth(): AuthSession | undefined {
    if (!this.isAuthenticated()) {
      return undefined
    }

    return this.store.get(keyAuthSession)
  },

  getAuth(): AuthSession {
    this.requireAuth()
    return this.tryGetAuth()!
  },

  setAuth(authSession: AuthSession) {
    this.store.set(keyAuthSession, authSession)
  },

  clearAuth() {
    this.store.delete(keyAuthSession)
  }

  // switchTeam(team?: { id: string; slug: string }) {
  //   if (team?.id) {
  //     this.store.set(keyTeamId, team.id)
  //     this.store.set(keyTeamSlug, team.slug)
  //   } else {
  //     this.store.delete(keyTeamId)
  //     this.store.delete(keyTeamSlug)
  //   }
  // }
}
