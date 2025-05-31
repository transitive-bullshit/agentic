import type { AuthUser } from '@agentic/platform-types'
import type { Tokens as AuthTokens } from '@openauthjs/openauth/client'

export type { AuthUser } from '@agentic/platform-types'
export type {
  AuthorizeResult,
  Tokens as AuthTokens
} from '@openauthjs/openauth/client'

export type OnUpdateAuthSessionFunction = (update?: {
  session: AuthTokens
  user: AuthUser
}) => unknown
