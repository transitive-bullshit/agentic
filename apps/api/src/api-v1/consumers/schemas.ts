import { z } from '@hono/zod-openapi'

import { consumerIdSchema } from '@/db'

export const consumerIdParamsSchema = z.object({
  consumerId: consumerIdSchema.openapi({
    param: {
      description: 'Consumer ID',
      name: 'consumerId',
      in: 'path'
    }
  })
})
