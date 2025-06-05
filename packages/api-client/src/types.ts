import type { Tokens as AuthTokens } from '@agentic/openauth/client'
import type { AuthUser } from '@agentic/platform-types'

export type {
  AuthorizeResult,
  Tokens as AuthTokens
} from '@agentic/openauth/client'
export type { AuthUser } from '@agentic/platform-types'

export type OnUpdateAuthSessionFunction = (update?: {
  session: AuthTokens
  user: AuthUser
}) => unknown
