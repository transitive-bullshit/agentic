import jwt from 'jsonwebtoken'

import { env } from '@/lib/env'

export function createProviderToken(project: { identifier: string }) {
  // TODO: Possibly in the future store stripe account ID as well and require
  // provider tokens to refresh after account changes?
  return jwt.sign({ projectIdentifier: project.identifier }, env.JWT_SECRET)
}
