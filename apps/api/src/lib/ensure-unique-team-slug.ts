import { assert } from '@agentic/platform-core'

import { db, eq, schema } from '@/db'

export async function ensureUniqueTeamSlug(slug: string) {
  slug = slug.toLocaleLowerCase()

  const [existingTeam, existingUser] = await Promise.all([
    db.query.teams.findFirst({
      where: eq(schema.teams.slug, slug)
    }),

    db.query.users.findFirst({
      where: eq(schema.users.username, slug)
    })
  ])

  assert(
    !existingUser && !existingTeam,
    409,
    `Team slug "${slug}" is not available`
  )
}
