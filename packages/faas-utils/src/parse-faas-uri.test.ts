import { expect, test } from 'vitest'

import { parseFaasUri } from './parse-faas-uri'

function success(value: string) {
  const result = parseFaasUri(value)
  expect(result).toBeTruthy()
  expect(result?.projectId).toBeTruthy()
  expect(result?.version || result?.deploymentHash).toBeTruthy()
  expect(result).toMatchSnapshot()
}

function error(value: string) {
  const result = parseFaasUri(value)
  expect(result).toBeUndefined()
}

test('username/projectName@deployment/servicePath success', () => {
  success('username/foo-bar@01234567/foo')
  success('username/foo-bar@abc123lz/foo')
  success('username/foobar123-yo@01234567/foo_bar_BAR_901')
  success('username/foobar@01234567/foo/bar/123/456')
})

test('username/projectName@deployment/servicePath error', () => {
  error('foo-bar@01234567/foo')
  error('%/foo-bar@01234567/foo')
  error('user/foo^bar@01234567/foo')
  error('user@foo^bar@01234567/foo')
  error('username/Foo-Bar@01234567/foo')
})

test('username/projectName@version/servicePath success', () => {
  success('username/foo-bar@latest/foo')
  success('username/foo-bar@dev/foo')
  success('username/foo-bar@1.0.0/foo')
  success('username/foobar123-yo@0.0.1/foo_bar_BAR_901')
  success('username/foobar123-yo@0.0.1/foo/bar/123-456')
})

test('username/projectName@version/servicePath error', () => {
  error('foo_bar@latest/foo')
  error('username/foo-bar@1.0.0/foo@')
  error('username/foo-bar@/foo')
  error('username/foo-bar@/foo/')
  error('username/fooBar123-yo@0.0.1/foo/bar/123-456')
})

test('username/projectName/servicePath success', () => {
  success('u/foo-bar/foo')
  success('a/foo-bar/foo_123')
  success('foo/foobar123-yo/foo_bar_BAR_901')
  success('foo/foobar123-yo/foo/bar/123/456')
})

test('username/projectName/servicePath error', () => {
  error('@/foo_bar/foo')
  error('foo-bar/foo\\/')
  error('user/_/foo')
  error('user/a 1/foo')
  error('u/FOO-bar/foo')
})

test('username/projectName@deployment success', () => {
  success('abc/hello-world@3d2e0fd5')
  success('a16z/foo-bar@f673db32c')
  success('foodoo/foo-bar@f673db32c')
  success('u/foobar123-yo@673db32c')
  success('username/foo-bar@01234567/')
})

test('username/projectName@deployment error', () => {
  error('/hello-world@3d2e0fd5')
  error('foo-bar@f673db32c')
  error('foodoo/foo@bar@f673db32c')
  error('u/fooBar123-yo@/673db32c')
  error('abc/Hello-World@3d2e0fd5')
})

test('username/projectName@version success', () => {
  success('abc/hello-world@1.0.3')
  success('a16z/foo-bar@latest')
  success('a16z/foo-bar@dev')
  success('foodoo/foo-bar@1.0.1')
  success('u/foobar123-yo@3.2.2234')
  success('username/foo-bar@1.0.3/')
})

test('username/projectName@version error', () => {
  error('/hello-world@3d2e0fd5')
  error('foo-bar@f673db32c')
  error('foodoo/foo@bar@f673db32c@')
  error('u/fooBar123-yo@/673db32c/')
  error('abc/hello-World@1.0.3')
})

test('username/projectName success', () => {
  success('abc/hello-world')
  success('a16z/foo-bar')
  success('foodoo/foo-bar')
  success('u/foobar123-yo')
  success('abc/hello-world/')
})

test('username/projectName error', () => {
  error('/hello-world')
  error('foo-barc')
  error('foodoo/foo@bar@')
  error('u/fooBar123-yo@/')
  error('abc/HELLO-WORLD')
})
