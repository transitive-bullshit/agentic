import { createSubjects } from '@openauthjs/openauth/subject'
import { z } from 'zod'

// TODO: share this with the API server
export const subjects = createSubjects({
  user: z.object({
    id: z.string()
  })
})
export type AuthUser = z.infer<typeof subjects.user>
