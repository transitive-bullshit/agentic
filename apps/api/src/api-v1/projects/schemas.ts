import { z } from '@hono/zod-openapi'

import {
  paginationSchema,
  projectIdentifierSchema,
  projectIdSchema,
  projectRelationsSchema
} from '@/db'

export const projectIdParamsSchema = z.object({
  projectId: projectIdSchema.openapi({
    param: {
      description: 'Project ID',
      name: 'projectId',
      in: 'path'
    }
  })
})

export const projectIdentifierQuerySchema = z.object({
  projectIdentifier: projectIdentifierSchema
})

export const populateProjectSchema = z.object({
  populate: z
    .union([projectRelationsSchema, z.array(projectRelationsSchema)])
    .default([])
    .transform((p) => (Array.isArray(p) ? p : [p]))
    .optional()
})

export const projectIdentifierAndPopulateSchema = z.object({
  ...populateProjectSchema.shape,
  ...projectIdentifierQuerySchema.shape
})

export const paginationAndPopulateProjectSchema = z.object({
  ...paginationSchema.shape,
  ...populateProjectSchema.shape
})
