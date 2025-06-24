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
  publish: z
    .union([z.literal('true'), z.literal('false')])
    .default('false')
    .transform((p) => p === 'true')
})

export const filterDeploymentSchema = z.object({
  projectIdentifier: projectIdentifierSchema.optional(),
  deploymentIdentifier: deploymentIdentifierSchema.optional()
})

export const populateDeploymentSchema = z.object({
  populate: z
    .union([deploymentRelationsSchema, z.array(deploymentRelationsSchema)])
    .default([])
    .transform((p) => (Array.isArray(p) ? p : [p]))
    .optional()
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
