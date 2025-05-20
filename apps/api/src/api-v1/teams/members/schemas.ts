import { z } from '@hono/zod-openapi'

import { userIdSchema } from '@/db'

import { teamIdParamsSchema } from '../schemas'

export const teamIdTeamMemberUserIdParamsSchema = z.object({
  ...teamIdParamsSchema.shape,

  userId: userIdSchema.openapi({
    param: {
      description: 'Team member user ID',
      name: 'userId',
      in: 'path'
    }
  })
})
