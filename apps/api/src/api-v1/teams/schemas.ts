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
