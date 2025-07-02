import { z } from '@hono/zod-openapi'

import {
  consumerIdSchema,
  consumerRelationsSchema,
  paginationSchema,
  projectIdentifierSchema
} from '@/db'

export const consumerIdParamsSchema = z.object({
  consumerId: consumerIdSchema.openapi({
    param: {
      description: 'Consumer ID',
      name: 'consumerId',
      in: 'path'
    }
  })
})

export const consumerApiKeyParamsSchema = z.object({
  apiKey: z
    .string()
    .nonempty()
    .openapi({
      param: {
        description: 'Consumer API key',
        name: 'apiKey',
        in: 'path'
      }
    })
})

export const projectIdentifierQuerySchema = z.object({
  projectIdentifier: projectIdentifierSchema
})

export const populateConsumerSchema = z.object({
  populate: z
    .union([consumerRelationsSchema, z.array(consumerRelationsSchema)])
    .default([])
    .transform((p) => (Array.isArray(p) ? p : [p]))
    .optional()
})

export const paginationAndPopulateConsumerSchema = z.object({
  ...paginationSchema.shape,
  ...populateConsumerSchema.shape
})

export const projectIdentifierAndPopulateConsumerSchema = z.object({
  ...projectIdentifierQuerySchema.shape,
  ...populateConsumerSchema.shape
})
