import { expectTypeOf, test } from 'vitest'

import type { LogLevel } from '@/lib/logger'

import type { LogEntry, RawLogEntry, RawUser, User } from './types'

type UserKeys = Exclude<keyof User & keyof RawUser, 'authProviders'>
type LogEntryKeys = keyof RawLogEntry & keyof LogEntry

test('User types are compatible', () => {
  expectTypeOf<RawUser>().toExtend<User>()

  expectTypeOf<User[UserKeys]>().toEqualTypeOf<RawUser[UserKeys]>()
})

test('LogEntry types are compatible', () => {
  expectTypeOf<RawLogEntry>().toExtend<LogEntry>()

  expectTypeOf<LogEntry[LogEntryKeys]>().toEqualTypeOf<
    RawLogEntry[LogEntryKeys]
  >()

  expectTypeOf<LogEntry['level']>().toEqualTypeOf<LogLevel>()
})
