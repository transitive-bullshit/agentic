import { expectTypeOf, test } from 'vitest'

import type { schema } from '.'
import type { User } from './types'

type UserSelect = typeof schema.users.$inferSelect

test('User types are compatible', () => {
  // TODO: { github?: AuthProvider | undefined } !== { github: AuthProvider | undefined }
  expectTypeOf<UserSelect>().toExtend<User>()

  expectTypeOf<User[keyof User]>().toEqualTypeOf<UserSelect[keyof UserSelect]>()
})
