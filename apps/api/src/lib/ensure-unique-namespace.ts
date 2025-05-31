import { assert, sha256 } from '@agentic/platform-core'

import { db, eq, schema } from '@/db'

export async function ensureUniqueNamespace(
  namespace: string,
  { label = 'Namespace' }: { label?: string } = {}
) {
  namespace = namespace.toLocaleLowerCase()

  const [existingTeam, existingUser] = await Promise.all([
    db.query.teams.findFirst({
      where: eq(schema.teams.slug, namespace)
    }),

    db.query.users.findFirst({
      where: eq(schema.users.username, namespace)
    })
  ])

  assert(
    !existingUser && !existingTeam,
    409,
    `${label} "${namespace}" is not available`
  )
}

export async function getUniqueNamespace(
  namespace?: string,
  { label = 'Namespace' }: { label?: string } = {}
) {
  namespace ??= `${label}_${(await sha256()).slice(0, 24)}`
  namespace = namespace
    .replaceAll(/[^a-zA-Z0-9_-]/g, '')
    .toLowerCase()
    .slice(0, schema.namespaceMaxLength - 1)

  let currentNamespace = namespace
  let attempts = 0

  do {
    try {
      await ensureUniqueNamespace(namespace, { label })

      return currentNamespace
    } catch (err) {
      if (++attempts > 10) {
        throw err
      }

      const suffix = (await sha256()).slice(0, 8)
      currentNamespace = `${namespace.slice(0, schema.namespaceMaxLength - 1 - suffix.length)}${suffix}`
    }
  } while (true)
}
