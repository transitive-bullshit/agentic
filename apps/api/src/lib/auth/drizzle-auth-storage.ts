import { and, db, eq, gt, isNull, like, or, schema } from '@/db'

import { type AuthStorageAdapter, joinKey, splitKey } from './auth-storage'

export function DrizzleAuthStorage(): AuthStorageAdapter {
  return {
    async get(key: string[]) {
      const id = joinKey(key)
      const entry = await db.query.authData.findFirst({
        where: eq(schema.authData.id, id)
      })
      if (!entry) return undefined

      if (entry.expiry && Date.now() >= entry.expiry.getTime()) {
        await db.delete(schema.authData).where(eq(schema.authData.id, id))
        return undefined
      }

      return entry.value
    },

    async set(key: string[], value: Record<string, any>, expiry?: Date) {
      const id = joinKey(key)

      await db
        .insert(schema.authData)
        .values({
          id,
          value,
          expiry
        })
        .onConflictDoUpdate({
          target: schema.authData.id,
          set: {
            value,
            expiry: expiry ?? null
          }
        })
    },

    async remove(key: string[]) {
      const id = joinKey(key)
      await db.delete(schema.authData).where(eq(schema.authData.id, id))
    },

    async *scan(prefix: string[]) {
      const now = new Date()
      const idPrefix = joinKey(prefix)

      const entries = await db.query.authData.findMany({
        where: and(
          like(schema.authData.id, `${idPrefix}%`),
          or(isNull(schema.authData.expiry), gt(schema.authData.expiry, now))
        )
      })

      for (const entry of entries) {
        yield [splitKey(entry.id), entry.value]
      }
    }
  }
}
