import { authSubjectSchemas } from '@agentic/platform-types'
import { createSubjects } from '@openauthjs/openauth/subject'

export const authSubjects = createSubjects(authSubjectSchemas)
