import { createSubjects } from '@openauthjs/openauth/subject'
import { z } from 'zod'

import { userIdSchema } from '@/db'

export const subjects = createSubjects({
  user: z.object({
    id: userIdSchema
  })
})
