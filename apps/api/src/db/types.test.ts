import { expectTypeOf, test } from 'vitest'

import type { schema } from '.'
import type { User } from './types'

type UserSelect = typeof schema.users.$inferSelect
type UserKeys = Exclude<keyof User, 'providers'>

test('User types are compatible', () => {
  // TODO: { github?: AuthProvider | undefined } !== { github: AuthProvider | undefined }
  expectTypeOf<UserSelect>().toExtend<User>()

  expectTypeOf<User[UserKeys]>().toEqualTypeOf<UserSelect[UserKeys]>()
})
