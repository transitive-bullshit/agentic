import { z } from '@hono/zod-openapi'

export const webhookSchema = z
  .object({
    url: z.string(),
    events: z.array(z.string())
  })
  .openapi('Webhook')
export type Webhook = z.infer<typeof webhookSchema>
