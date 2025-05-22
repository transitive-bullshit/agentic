import type { AuthSession } from '@agentic/platform-api-client'
import { assert } from '@agentic/platform-core'
import Conf from 'conf'

export type AuthState = {
  cookie: string
  session: AuthSession
  teamId?: string
  teamSlug?: string
}

const keyTeamId = 'teamId'
const keyTeamSlug = 'teamSlug'
const keyCookie = 'cookie'
const keySession = 'session'

export const AuthStore = {
  store: new Conf({ projectName: 'agentic' }),

  isAuthenticated() {
    return this.store.has(keyCookie) && this.store.has(keySession)
  },

  requireAuth() {
    assert(
      this.isAuthenticated(),
      'Command requires authentication. Please login first.'
    )
  },

  tryGetAuth(): AuthState | undefined {
    if (!this.isAuthenticated()) {
      return undefined
    }

    return {
      cookie: this.store.get(keyCookie),
      session: this.store.get(keySession),
      teamId: this.store.get(keyTeamId),
      teamSlug: this.store.get(keyTeamSlug)
    } as AuthState
  },

  getAuth(): AuthState {
    this.requireAuth()
    return this.tryGetAuth()!
  },

  setAuth({ cookie, session }: { cookie: string; session: AuthSession }) {
    this.store.set(keyCookie, cookie)
    this.store.set(keySession, session)
  },

  clearAuth() {
    this.store.delete(keyCookie)
    this.store.delete(keySession)
    this.store.delete(keyTeamId)
    this.store.delete(keyTeamSlug)
  },

  switchTeam(team?: { id: string; slug: string }) {
    if (team?.id) {
      this.store.set(keyTeamId, team.id)
      this.store.set(keyTeamSlug, team.slug)
    } else {
      this.store.delete(keyTeamId)
      this.store.delete(keyTeamSlug)
    }
  }
}
