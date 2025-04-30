import { z } from '@hono/zod-openapi'

import { userIdSchema } from '@/db'

import { teamSlugParamsSchema } from '../schemas'

export const teamSlugTeamMemberUserIdParamsSchema = z.object({
  ...teamSlugParamsSchema.shape,
  userId: userIdSchema.openapi({
    param: {
      description: 'Team member user ID',
      name: 'userId',
      in: 'path'
    }
  })
})
