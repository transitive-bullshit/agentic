import { z } from '@hono/zod-openapi'

import {
  deploymentIdentifierSchema,
  deploymentIdSchema,
  deploymentRelationsSchema,
  paginationSchema,
  projectIdentifierSchema
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
  projectIdentifier: projectIdentifierSchema.optional(),
  deploymentIdentifier: deploymentIdentifierSchema.optional()
})

export const populateDeploymentSchema = z.object({
  populate: z.array(deploymentRelationsSchema).default([]).optional()
})

export const deploymentIdentifierQuerySchema = z.object({
  deploymentIdentifier: deploymentIdentifierSchema
})

export const deploymentIdentifierAndPopulateSchema = z.object({
  ...populateDeploymentSchema.shape,
  ...deploymentIdentifierQuerySchema.shape
})

export const paginationAndPopulateAndFilterDeploymentSchema = z.object({
  ...paginationSchema.shape,
  ...populateDeploymentSchema.shape,
  ...filterDeploymentSchema.shape
})
