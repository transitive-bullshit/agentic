import { createId } from '@paralleldrive/cuid2'
import { sql } from 'drizzle-orm'
import { pgEnum, text, timestamp } from 'drizzle-orm/pg-core'
import { createSchemaFactory } from 'drizzle-zod'

export const id = text('id').primaryKey().$defaultFn(createId)

export const timestamps = {
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt')
    .notNull()
    .default(sql`now()`)
}

export const userRoleEnum = pgEnum('UserRole', ['user', 'admin'])
export const teamMemberRoleEnum = pgEnum('TeamMemberRole', ['user', 'admin'])

export const { createInsertSchema, createSelectSchema, createUpdateSchema } =
  createSchemaFactory({
    coerce: {
      // Coerce dates / strings to timetamps
      date: true
    }
  })
