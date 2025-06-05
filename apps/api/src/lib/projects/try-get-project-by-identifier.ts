import { assert } from '@agentic/platform-core'
import { parseProjectIdentifier } from '@agentic/platform-validators'

import type { AuthenticatedHonoContext } from '@/lib/types'
import { db, eq, projectIdSchema, type RawProject, schema } from '@/db'

/**
 * Attempts to find the Project matching the given ID or identifier.
 *
 * Throws a HTTP 404 error if not found.
 *
 * Does not take care of ACLs.
 */
export async function tryGetProjectByIdentifier(
  ctx: AuthenticatedHonoContext,
  {
    projectIdentifier,
    strict = false,
    ...dbQueryOpts
  }: {
    projectIdentifier: string
    strict?: boolean
    with?: {
      user?: true
      team?: true
      lastPublishedproject?: true
      lastproject?: true
    }
  }
): Promise<RawProject> {
  assert(projectIdentifier, 400, 'Missing required project identifier')

  // First check if the identifier is a project ID
  if (projectIdSchema.safeParse(projectIdentifier).success) {
    const project = await db.query.projects.findFirst({
      ...dbQueryOpts,
      where: eq(schema.projects.id, projectIdentifier)
    })
    assert(project, 404, `Project not found "${projectIdentifier}"`)
    return project
  }

  const parsedProjectIdentifier = parseProjectIdentifier(projectIdentifier, {
    strict
  })
  assert(
    parsedProjectIdentifier?.projectIdentifier,
    400,
    `Invalid project identifier "${projectIdentifier}"`
  )
  projectIdentifier = parsedProjectIdentifier.projectIdentifier

  const project = await db.query.projects.findFirst({
    ...dbQueryOpts,
    where: eq(schema.projects.identifier, projectIdentifier)
  })
  assert(project, 404, `Project not found "${projectIdentifier}"`)

  return project
}
