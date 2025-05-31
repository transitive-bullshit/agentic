import { z } from '@hono/zod-openapi'

export const authSubjectSchemas = {
  user: z.object({
    id: z.string(),
    username: z.string()
  })
}
export type AuthUser = z.infer<(typeof authSubjectSchemas)['user']>
