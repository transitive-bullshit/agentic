import { sign } from 'hono/jwt'

import type { RawUser } from '@/db'
import { env } from '@/lib/env'

export async function createAuthToken(user: RawUser): Promise<string> {
  return sign(
    {
      type: 'user',
      id: user.id,
      username: user.username
    },
    env.JWT_SECRET
  )
}
