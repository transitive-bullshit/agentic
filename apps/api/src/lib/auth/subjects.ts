import { createSubjects } from '@agentic/openauth/subject'
import { authSubjectSchemas } from '@agentic/platform-types'

export const subjects = createSubjects(authSubjectSchemas)
