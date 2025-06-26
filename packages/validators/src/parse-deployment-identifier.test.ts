import { describe, expect, test } from 'vitest'

import { parseDeploymentIdentifier } from './parse-deployment-identifier'
import {
  isValidDeploymentHash,
  isValidDeploymentIdentifier,
  isValidNamespace,
  isValidProjectIdentifier,
  isValidProjectSlug
} from './validators'

function success(...args: Parameters<typeof parseDeploymentIdentifier>) {
  const result = parseDeploymentIdentifier(...args)
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

  if (result!.deploymentHash) {
    expect(isValidDeploymentHash(result!.deploymentHash)).toBe(true)
  }

  expect(result).toMatchSnapshot()
}

function error(...args: Parameters<typeof parseDeploymentIdentifier>) {
  expect(() => parseDeploymentIdentifier(...args)).throws()
}

describe('parseDeploymentIdentifier', () => {
  test('strict mode valid', () => {
    success('@username/foo-bar')
    success('@username/foo-bar@01234567')
    success('@username/foo-bar@latest')
    success('@username/foo-bar@dev')
    success('@username/foo-bar@1.0.0')
    success('@username/foo-bar@abc123lz')
    success('@username/foobar123-yo@01234567')

    success('@u/foo-bar')
    success('@a/foo-bar')
    success('@foo/foobar123-yo')
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

    error('@foo-bar@01234567')
    error('@%/foo-bar@01234567')
    error('@user/foo^bar@01234567')
    error('@user@foo^bar@01234567')
    error('@username/Foo-Bar@01234567')
    error('username/foo-bar')
    error('@Username/foo-bar')
    error('@username/Foo-bar')
    error('@username/foo-bar/')
    error('@username/foo_bar')

    error('@foo_bar@latest')

    error('//@username/foo-bar@01234567')
    error('https://@username/foo-bar@01234567')
    error('https://example.com/@username/foo-bar')
  })

  test('non-strict mode valid', () => {
    success('https://gateway.agentic.so/@username/foo-bar', { strict: false })
    success('https://gateway.agentic.so/@username/foo-bar@latest', {
      strict: false
    })
    success('https://gateway.agentic.so/@username/foo-bar@01234567', {
      strict: false
    })
    success('/@username/foo-bar@01234567', { strict: false })
    success('@username/foo-bar@01234567/', { strict: false })

    success('/@username/foo-bar@01234567/', { strict: false })
    success('/@username/foo-bar@latest/', { strict: false })
    success('/@username/foo-bar@dev/', { strict: false })
    success('/@username/foo-bar@1.0.0/', { strict: false })
    success('/@username/foo-bar/', { strict: false })

    success('https://gateway.agentic.so/@username/foo-bar@01234567/foo/', {
      strict: false
    })
    success('https://gateway.agentic.so/@username/foo-bar/', {
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
    error('https://gateway.agentic.so/@username/', { strict: false })
    error('https://gateway.agentic.so/call/@username/foo-bar@latest/tool', {
      strict: false
    })
    error('/call/@username/foo-bar/foo', { strict: false })
    error('//@username/foo-bar/foo', { strict: false })
    error('@username/foo-bar/foo//', { strict: false })

    error('@username/foo-bar/foo😀', { strict: false })
    error('@username/Foo-Bar@dev/foo/', { strict: false })

    error('@username/Foo', { strict: false })
    error('@username/foo😀', { strict: false })
  })
})
