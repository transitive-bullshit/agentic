import { z } from '@hono/zod-openapi'

import { consumerIdSchema, paginationSchema } from '@/db'
import { consumerRelationsSchema } from '@/db/schema'

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
  populate: z.array(consumerRelationsSchema).default([]).optional()
})

export const paginationAndPopulateConsumerSchema = z.object({
  ...paginationSchema.shape,
  ...populateConsumerSchema.shape
})
