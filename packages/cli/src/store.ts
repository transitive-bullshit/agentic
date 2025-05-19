import type { User } from '@agentic/platform-db'
import { assert } from '@agentic/platform-core'
import Conf from 'conf'

export const store = new Conf({ projectName: 'agentic' })

export type Auth = {
  token: string
  user: User
  teamId?: string
  teamSlug?: string
}

const keyTeamId = 'teamId'
const keyTeamSlug = 'teamSlug'
const keyToken = 'token'
const keyUser = 'user'

export function isAuthenticated() {
  return store.has(keyToken) && store.has(keyUser)
}

export function requireAuth() {
  assert(
    isAuthenticated(),
    'Command requires authentication. Please login first.'
  )
}

export function getAuth(): Auth {
  requireAuth()

  return {
    token: store.get(keyToken),
    user: store.get(keyUser),
    teamId: store.get(keyTeamId),
    teamSlug: store.get(keyTeamSlug)
  } as Auth
}

export function signinUser({ token, user }: { token: string; user: string }) {
  store.set(keyToken, token)
  store.set(keyUser, user)
  store.delete(keyTeamId)
  store.delete(keyTeamSlug)
}

export function signout() {
  store.delete(keyToken)
  store.delete(keyUser)
  store.delete(keyTeamId)
  store.delete(keyTeamSlug)
}

export function switchTeam(team?: { id: string; slug: string }) {
  if (team?.id) {
    store.set(keyTeamId, team.id)
    store.set(keyTeamSlug, team.slug)
  } else {
    store.delete(keyTeamId)
    store.delete(keyTeamSlug)
  }
}
