import { z } from '@hono/zod-openapi'

import { schema } from '@/db'

export const authSessionResponseSchema = z
  .object({
    token: z.string().nonempty(),
    user: schema.userSelectSchema
  })
  .openapi('AuthSession')
