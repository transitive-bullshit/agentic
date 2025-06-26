import { describe, expect, test } from 'vitest'

import { parseToolIdentifier } from './parse-tool-identifier'
import {
  isValidDeploymentHash,
  isValidDeploymentIdentifier,
  isValidNamespace,
  isValidProjectIdentifier,
  isValidProjectSlug,
  isValidToolName
} from './validators'

function success(...args: Parameters<typeof parseToolIdentifier>) {
  const result = parseToolIdentifier(...args)
  expect(result).toBeTruthy()
  expect(result!.projectIdentifier).toBeTruthy()
  expect(result!.projectNamespace).toBeTruthy()
  expect(result!.projectSlug).toBeTruthy()
  expect(result!.deploymentIdentifier).toBeTruthy()
  expect(result!.deploymentVersion || result!.deploymentHash).toBeTruthy()
  expect(isValidProjectIdentifier(result!.projectIdentifier)).toBe(true)
  expect(isValidProjectSlug(result!.projectSlug)).toBe(true)
  expect(isValidNamespace(result!.projectNamespace)).toBe(true)
  expect(isValidDeploymentIdentifier(result!.deploymentIdentifier)).toBe(true)
  expect(isValidToolName(result!.toolName)).toBe(true)

  if (result!.deploymentHash) {
    expect(isValidDeploymentHash(result!.deploymentHash)).toBe(true)
  }

  expect(result).toMatchSnapshot()
}

function error(...args: Parameters<typeof parseToolIdentifier>) {
  expect(() => parseToolIdentifier(...args)).throws()
}

describe('parseToolIdentifier', () => {
  test('strict mode valid', () => {
    success('@username/foo-bar@01234567/foo')
    success('@username/foo-bar@01234567/foo')
    success('@username/foo-bar@abc123lz/foo')
    success('@username/foo-bar/foo')
    success('@username/foobar123-yo@01234567/foo_bar_BAR_901')
    success('@username/foobar@01234567/get_weather01')
    success('@username/foobar@latest/foo')
    success('@username/foobar@dev/foo')
    success('@username/foobar@1.0.0/foo')

    success('@username/foo-bar@latest/foo')
    success('@username/foo-bar@dev/foo')
    success('@username/foo-bar@1.0.0/foo')
    success('@username/foobar123-yo@0.0.1/foo_bar_BAR_901')
    success('@username/foobar123-yo@0.0.1/foo')

    success('@u/foo-bar/foo')
    success('@a/foo-bar/foo_123')
    success('@foo/foobar123-yo/foo_bar_BAR_901')
    success('@foo/foobar123-yo/foo')
    success('@foo/bar/baz')
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
    error('@foo/bar')
    error('@foo/bar/')

    error('@foo-bar@01234567/foo')
    error('@%/foo-bar@01234567/foo')
    error('@user/foo^bar@01234567/foo')
    error('@user@foo^bar@01234567/foo')
    error('@username/Foo-Bar@01234567/foo')
    error('username/foo-bar/foo')
    error('@Username/foo-bar/foo')
    error('@username/Foo-bar/foo')
    error('@username/foo-bar/')
    error('@username/foo-bar')

    error('@foo_bar@latest/foo')
    error('@username/foo-bar@1.0.0/foo@')
    error('@username/foo-bar@/foo')
    error('@username/foo-bar@/foo/')
    error('@username/fooBar123-yo@0.0.1/foo/bar/123-456')

    error('//@username/foo-bar@01234567/foo')
    error('https://@username/foo-bar@01234567/foo')
    error('https://example.com/@username/foo-bar/foo')
  })

  test('non-strict mode valid', () => {
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
    error('https://gateway.agentic.so/@username/foo-bar', { strict: false })
    error('https://gateway.agentic.so/call/@username/foo-bar@latest/tool', {
      strict: false
    })
    error('/call/@username/foo-bar/foo', { strict: false })
    error('//@username/foo-bar/foo', { strict: false })
    error('@username/foo-bar/foo//', { strict: false })

    error('@username/foo-bar/foo😀', { strict: false })
    error('@username/Foo-Bar@dev/foo/', { strict: false })
  })
})
