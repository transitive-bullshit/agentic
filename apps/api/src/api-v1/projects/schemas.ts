import { z } from '@hono/zod-openapi'

import { projectIdSchema } from '@/db'

export const ProjectIdParamsSchema = z.object({
  projectId: projectIdSchema.openapi({
    param: {
      description: 'Project ID',
      name: 'projectId',
      in: 'path'
    }
  })
})
