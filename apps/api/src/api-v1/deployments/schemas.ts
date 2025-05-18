import { z } from '@hono/zod-openapi'

import { deploymentIdSchema, paginationSchema, projectIdSchema } from '@/db'
import { deploymentRelationsSchema } from '@/db/schema'

export const deploymentIdParamsSchema = z.object({
  deploymentId: deploymentIdSchema.openapi({
    param: {
      description: 'deployment ID',
      name: 'deploymentId',
      in: 'path'
    }
  })
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
