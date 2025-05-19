import { z } from '@hono/zod-openapi'

import {
  deploymentIdSchema,
  deploymentRelationsSchema,
  paginationSchema,
  projectIdSchema
} from '@/db'

export const deploymentIdParamsSchema = z.object({
  deploymentId: deploymentIdSchema.openapi({
    param: {
      description: 'deployment ID',
      name: 'deploymentId',
      in: 'path'
    }
  })
})

export const createDeploymentQuerySchema = z.object({
  publish: z.boolean().default(false).optional()
})

export const filterDeploymentSchema = z.object({
  projectId: projectIdSchema.optional()
})

export const populateDeploymentSchema = z.object({
  populate: z.array(deploymentRelationsSchema).default([]).optional()
})

export const paginationAndPopulateAndFilterDeploymentSchema = z.object({
  ...paginationSchema.shape,
  ...populateDeploymentSchema.shape,
  ...filterDeploymentSchema.shape
})
