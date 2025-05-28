import { expect, test } from 'vitest'

import { parseFaasIdentifier } from './parse-faas-identifier'
import * as validators from './validators'

function success(...args: Parameters<typeof parseFaasIdentifier>) {
  const result = parseFaasIdentifier(...args)
  expect(result).toBeTruthy()
  expect(result!.projectIdentifier).toBeTruthy()
  expect(result!.version || result!.deploymentHash).toBeTruthy()
  expect(validators.projectIdentifier(result!.projectIdentifier)).toBe(true)
  expect(validators.toolPath(result!.toolPath)).toBe(true)

  if (result!.deploymentHash) {
    expect(validators.deploymentHash(result!.deploymentHash)).toBe(true)
    expect(validators.deploymentIdentifier(result!.deploymentIdentifier!)).toBe(
      true
    )
  }

  expect(result).toMatchSnapshot()
}

function error(...args: Parameters<typeof parseFaasIdentifier>) {
  const result = parseFaasIdentifier(...args)
  expect(result).toBeUndefined()
}

test('URL prefix success', () => {
  success('https://api.saasify.sh/username/foo-bar@01234567/foo')
  success('/username/foo-bar@01234567/foo')
  success('https://api.saasify.sh/username/foo-bar@01234567/foo/bar/456/123')
  success('/username/foo-bar@01234567/foo/bar/456/123')
  success('/username/foo-bar@01234567/foo/bar/456/123')
  success('/username/foo-bar@latest/foo/bar/456/123')
  success('/username/foo-bar@dev/foo/bar/456/123')
  success('/username/foo-bar@2.1.0/foo/bar/456/123')
})

test('URL prefix error', () => {
  error('https://api.saasify.sh/2/proxy/username/foo-bar@01234567/foo')
  error('/call/username/foo-bar@01234567/foo')
  error('//username/foo-bar@01234567/foo')
})

test('URL suffix success', () => {
  success('username/foo-bar@01234567/foo/')
  success('username/foo-bar@latest/foo/')
  success('username/foo-bar@dev/foo/')
  success('username/foo-bar@2.1.0/foo/')
})

test('URL suffix error', () => {
  error('username/foo-bar@01234567/foo😀')
  error('username/Foo-Bar@dev/foo/')
})

test('URL prefix and suffix success', () => {
  success('https://api.saasify.sh/username/foo-bar@01234567/foo/')
  success('https://api.saasify.sh/username/foo-bar@01234567/foo/bar/123')
})

test('namespace success', () => {
  success('https://api.saasify.sh/foo-bar@01234567/foo', {
    namespace: 'username'
  })
  success('/foo-bar@01234567/foo', { namespace: 'username' })
  success('/foo-bar@01234567/foo', { namespace: 'username' })
  success('/foo-bar@01234567/foo/', { namespace: 'username' })
  success('https://api.saasify.sh/foo-bar@01234567/foo/bar/123', {
    namespace: 'username'
  })
  success('/foo-bar@01234567/foo/bar/123', { namespace: 'username' })
  success('/foo-bar@latest/foo/bar/123', { namespace: 'username' })
  success('/foo-bar@dev/foo/bar/123', { namespace: 'username' })
  success('/foo-bar@1.2.3/foo/bar/123', { namespace: 'username' })
})

test('namespace error', () => {
  error('https://api.saasify.sh/foo-bar@01234567/foo')
  error('https://api.saasify.sh/foo-bar@latest/foo')
  error('/foo-bar@01234567/foo')
  error('/foo-bar@dev/foo')
  error('/foo-bar@01234567/foo')
  error('/foo-bar@01234567/foo/')
  error('/foo-bar@01234567/foo/bar/123')
  error('/foo-bar@0latest/foo/bar/123')
})
