import { z } from '@hono/zod-openapi'

import { userIdSchema } from '@/db'

export const userIdParamsSchema = z.object({
  userId: userIdSchema.openapi({
    param: {
      description: 'User ID',
      name: 'userId',
      in: 'path'
    }
  })
})
