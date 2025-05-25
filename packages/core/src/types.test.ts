import { expectTypeOf, test } from 'vitest'

import type { Logger } from './types'

test('Logger type is compatible with Console', () => {
  expectTypeOf<Console>().toExtend<Logger>()
})
