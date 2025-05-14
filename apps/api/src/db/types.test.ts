import { expectTypeOf, test } from 'vitest'

import type { RawUser, User } from './types'

type UserKeys = Exclude<keyof User, 'providers'>

test('User types are compatible', () => {
  expectTypeOf<RawUser>().toExtend<User>()

  expectTypeOf<User[UserKeys]>().toEqualTypeOf<RawUser[UserKeys]>()
})
