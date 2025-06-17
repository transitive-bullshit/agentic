import type { Simplify } from 'type-fest'
import { expectTypeOf, test } from 'vitest'

import type {
  Consumer,
  LogEntry,
  RawConsumer,
  RawConsumerUpdate,
  RawDeployment,
  RawLogEntry,
  RawProject,
  RawUser,
  User
} from './types'

type UserKeys = Exclude<keyof User & keyof RawUser, 'authProviders'>
type LogEntryKeys = keyof RawLogEntry & keyof LogEntry
type ConsumerKeys = keyof RawConsumer & keyof Consumer

type TODOFixedConsumer = Simplify<
  Omit<Consumer, 'user' | 'project' | 'deployment'> & {
    user?: RawUser | null
    project?: RawProject | null
    deployment?: RawDeployment | null
  }
>

test('User types are compatible', () => {
  expectTypeOf<RawUser>().toExtend<User>()

  expectTypeOf<User[UserKeys]>().toEqualTypeOf<RawUser[UserKeys]>()
})

test('LogEntry types are compatible', () => {
  expectTypeOf<RawLogEntry>().toExtend<LogEntry>()

  expectTypeOf<LogEntry[LogEntryKeys]>().toEqualTypeOf<
    RawLogEntry[LogEntryKeys]
  >()
})

test('Consumer types are compatible', () => {
  expectTypeOf<RawConsumer>().toExtend<TODOFixedConsumer>()

  expectTypeOf<TODOFixedConsumer[ConsumerKeys]>().toEqualTypeOf<
    RawConsumer[ConsumerKeys]
  >()

  // Ensure that we can pass any Consumer as a RawConsumerUpdate
  expectTypeOf<Consumer>().toExtend<RawConsumerUpdate>()

  // Ensure that we can pass any RawConsumer as a RawConsumerUpdate
  expectTypeOf<RawConsumer>().toExtend<RawConsumerUpdate>()
})
