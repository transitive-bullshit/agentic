import { z } from '@hono/zod-openapi'

import {
  consumerIdSchema,
  consumerRelationsSchema,
  paginationSchema
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

export const consumerTokenParamsSchema = z.object({
  token: z
    .string()
    .nonempty()
    .openapi({
      param: {
        description: 'Consumer token',
        name: 'token',
        in: 'path'
      }
    })
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
