import { z } from '@hono/zod-openapi'

import { teamSlugSchema } from '@/db'

export const TeamSlugParamsSchema = z.object({
  team: teamSlugSchema.openapi({
    param: {
      description: 'Team slug',
      name: 'team',
      in: 'path'
    }
  })
})

export const TeamMemberUserIdParamsSchema = z.object({
  userId: z.string().openapi({
    param: {
      description: 'Team member user id',
      name: 'userId',
      in: 'path'
    }
  })
})
