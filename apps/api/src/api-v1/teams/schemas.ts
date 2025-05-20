import { z } from '@hono/zod-openapi'

import { teamIdSchema } from '@/db'

export const teamIdParamsSchema = z.object({
  teamId: teamIdSchema.openapi({
    param: {
      description: 'Team ID',
      name: 'teamId',
      in: 'path'
    }
  })
})
