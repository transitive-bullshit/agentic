import { assert } from '@agentic/platform-core'
import { parseFaasIdentifier } from '@agentic/platform-validators'

import type { AuthenticatedContext } from '@/lib/types'
import { db, eq, projectIdSchema, type RawProject, schema } from '@/db'
import { ensureAuthUser } from '@/lib/ensure-auth-user'

/**
 * Attempts to find the Project matching the given ID or identifier.
 *
 * Throws a HTTP 404 error if not found.
 *
 * Does not take care of ACLs.
 */
export async function tryGetProjectByIdentifier(
  ctx: AuthenticatedContext,
  {
    projectIdentifier,
    ...dbQueryOpts
  }: {
    projectIdentifier: string
    with?: {
      user?: true
      team?: true
      lastPublishedproject?: true
      lastproject?: true
    }
  }
): Promise<RawProject> {
  assert(projectIdentifier, 400, 'Missing required project identifier')
  const user = await ensureAuthUser(ctx)

  // First check if the identifier is a project ID
  if (projectIdSchema.safeParse(projectIdentifier).success) {
    const project = await db.query.projects.findFirst({
      ...dbQueryOpts,
      where: eq(schema.projects.id, projectIdentifier)
    })
    assert(project, 404, `Project not found "${projectIdentifier}"`)
    return project
  }

  const teamMember = ctx.get('teamMember')
  const namespace = teamMember ? teamMember.teamSlug : user.username
  const parsedFaas = parseFaasIdentifier(projectIdentifier, {
    namespace
  })
  assert(
    parsedFaas?.projectIdentifier,
    400,
    `Invalid project identifier "${projectIdentifier}"`
  )

  const project = await db.query.projects.findFirst({
    ...dbQueryOpts,
    where: eq(schema.projects.identifier, parsedFaas.projectIdentifier)
  })
  assert(project, 404, `Project not found "${projectIdentifier}"`)

  return project
}
