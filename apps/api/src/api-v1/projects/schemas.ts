import { z } from '@hono/zod-openapi'

import { paginationSchema, projectIdSchema } from '@/db'
import { projectRelationsSchema } from '@/db/schema'

export const projectIdParamsSchema = z.object({
  projectId: projectIdSchema.openapi({
    param: {
      description: 'Project ID',
      name: 'projectId',
      in: 'path'
    }
  })
})

export const populateProjectSchema = z.object({
  populate: z.array(projectRelationsSchema).default([]).optional()
})

export const paginationAndPopulateProjectSchema = z.object({
  ...paginationSchema.shape,
  ...populateProjectSchema.shape
})
