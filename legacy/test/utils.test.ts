import test from 'ava'

import { isValidTaskIdentifier } from '@/utils'

test('isValidTaskIdentifier - valid', async (t) => {
  t.true(isValidTaskIdentifier('foo'))
  t.true(isValidTaskIdentifier('foo_bar_179'))
  t.true(isValidTaskIdentifier('fooBarBAZ'))
  t.true(isValidTaskIdentifier('foo-bar-baz_'))
  t.true(isValidTaskIdentifier('_'))
  t.true(isValidTaskIdentifier('_foo___'))
})

test('isValidTaskIdentifier - invalid', async (t) => {
  t.false(isValidTaskIdentifier(null as any))
  t.false(isValidTaskIdentifier(''))
  t.false(isValidTaskIdentifier('-'))
  t.false(isValidTaskIdentifier('x'.repeat(65)))
  t.false(isValidTaskIdentifier('-foo'))
})
