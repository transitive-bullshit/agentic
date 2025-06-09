import { describe, expect, test } from 'vitest'

import { parseProjectIdentifier } from './parse-project-identifier'
import {
  isValidNamespace,
  isValidProjectIdentifier,
  isValidProjectName
} from './validators'

function success(...args: Parameters<typeof parseProjectIdentifier>) {
  const result = parseProjectIdentifier(...args)
  expect(result).toBeTruthy()
  expect(result!.projectIdentifier).toBeTruthy()
  expect(result!.projectNamespace).toBeTruthy()
  expect(result!.projectName).toBeTruthy()
  expect(isValidProjectIdentifier(result!.projectIdentifier)).toBe(true)
  expect(isValidProjectName(result!.projectName)).toBe(true)
  expect(isValidNamespace(result!.projectNamespace)).toBe(true)
  expect(result).toMatchSnapshot()
}

function error(...args: Parameters<typeof parseProjectIdentifier>) {
  expect(() => parseProjectIdentifier(...args)).throws()
}

describe('parseProjectIdentifier', () => {
  test('strict mode valid', () => {
    success('@username/foo')
    success('@username/foo-bar')
    success('@username/foobar123-yo')
    success('@u/foo-bar')
    success('@a/foo-bar')
    success('@foo/foobar123-yo')
    success('@foo/bar')
  })

  test('strict mode invalid', () => {
    error()
    error('')
    error('foo')
    error('foo/bar')
    error('foo/bar/baz')
    error('foo/bar/baz/qux')
    error('@foo/bar/baz/qux')
    error('@foo/bar/baz/qux/quux')
    error('@foo/bar/baz/qux/quux/corge')
    error('@foo/bar/baz/qux/quux/corge/grault')
    error('@foo/bar/baz/qux/quux/corge/grault/garply')
    error('@foo/bar/baz/')
    error('@foo')
    error('@foo/bar/')

    error('@foo-bar')
    error('@%/foo-bar')
    error('@user/foo^bar')
    error('@user@foo^bar')
    error('@username/Foo-Bar')
    error('username/foo-bar/foo')
    error('@Username/foo-bar/foo')
    error('@username/Foo-bar/foo')
    error('@username/foo-bar/')
    error('username/foo-bar')

    error('@foo_bar')
    error('@Username/foo-bar')
    error('@username/Foo-bar')
    error('@username/foo_bar')
    error('@username_/foo-bar')
    error('@username/fooBar123-yo/')

    error('//@username/foo-bar@01234567/foo')
    error('https://@username/foo-bar')
    error('https://example.com/@username/foo-bar')
  })

  test('non-strict mode valid', () => {
    success('https://gateway.agentic.so/@username/foo-bar', {
      strict: false
    })
    success('/@username/foo-bar', { strict: false })
    success('@username/foo-bar', { strict: false })
    success('https://gateway.agentic.so/@username/foo-bar', {
      strict: false
    })

    success('/@username/foo-bar', { strict: false })
    success('/@username/foo-bar', { strict: false })
    success('/@username/foo-bar', { strict: false })

    success('https://gateway.agentic.so/@username/foo-bar', {
      strict: false
    })
    success('https://gateway.agentic.so/@username/foo-bar@01234567/', {
      strict: false
    })
    success('https://gateway.agentic.so/@username/foo-bar@latest', {
      strict: false
    })

    success('https://gateway.agentic.so/@username/foo-bar@01234567/foo', {
      strict: false
    })
    success('/@username/foo-bar@01234567/foo', { strict: false })
    success('@username/foo-bar@01234567/foo/', { strict: false })
    success('https://gateway.agentic.so/@username/foo-bar@01234567/foo/', {
      strict: false
    })

    success('/@username/foo-bar@01234567/foo/', { strict: false })
    success('/@username/foo-bar@latest/foo/', { strict: false })
    success('/@username/foo-bar@dev/foo/', { strict: false })
    success('/@username/foo-bar@1.0.0/foo/', { strict: false })
    success('/@username/foo-bar/foo/', { strict: false })

    success('https://gateway.agentic.so/@username/foo-bar@01234567/foo/', {
      strict: false
    })
    success('https://gateway.agentic.so/@username/foo-bar/foo/', {
      strict: false
    })
    success('https://gateway.agentic.so/@username/foo-bar@latest/foo/', {
      strict: false
    })
  })

  test('non-strict mode invalid', () => {
    error(undefined, { strict: false })
    error('', { strict: false })
    error('https://gateway.agentic.so', { strict: false })
    error('//gateway.agentic.so', { strict: false })
    error('https://gateway.agentic.so/@username', { strict: false })
    error('https://gateway.agentic.so/call/@username/foo-bar@latest/tool', {
      strict: false
    })
    error('/call/@username/foo-bar/foo', { strict: false })
    error('//@username/foo-bar/foo', { strict: false })
    error('@username/foo-bar/foo//', { strict: false })

    error('@username/foo-bar/foo😀', { strict: false })
    error('@username/Foo-Bar@dev/foo/', { strict: false })
    error('@username/Foo-Bar', { strict: false })
    error('@username/foo😀', { strict: false })
  })
})
