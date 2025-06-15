import { z } from '@hono/zod-openapi'

export const authUserSchema = z.object({
  type: z.literal('user'),
  id: z.string(),
  username: z.string()
})
export type AuthUser = z.infer<typeof authUserSchema>
