import { subjectSchemas } from '@agentic/platform-schemas'
import { createSubjects } from '@openauthjs/openauth/subject'

export const subjects = createSubjects(subjectSchemas)
