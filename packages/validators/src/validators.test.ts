import { expect, test } from 'vitest'

import * as validators from './validators'

test('email success', () => {
  expect(validators.email('t@t.com')).toBe(true)
  expect(validators.email('abc@gmail.com')).toBe(true)
  expect(validators.email('abc@foo.io')).toBe(true)
})

test('email failure', () => {
  expect(validators.email('t@t')).toBe(false)
  expect(validators.email('abc')).toBe(false)
  expect(validators.email('@')).toBe(false)
})

test('username success', () => {
  expect(validators.username('z')).toBe(true)
  expect(validators.username('abc')).toBe(true)
  expect(validators.username('abc-123')).toBe(true)
  expect(validators.username('Foo123')).toBe(true)
  expect(validators.username('asldfkjasldkfjlaksdfjlkas')).toBe(true)
})

test('username failure (invalid)', () => {
  expect(validators.username('ab%')).toBe(false)
  expect(validators.username('.'))
  expect(validators.username('$'))
  expect(validators.username('abc_123'))
  expect(validators.username('a'.repeat(65))).toBe(false)
})

test('password success', () => {
  expect(validators.password('abc')).toBe(true)
  expect(validators.password('password')).toBe(true)
  expect(validators.password('asldfkjasldkfjlaksdfjlkas')).toBe(true)
})

test('password failure', () => {
  expect(validators.password('aa')).toBe(false)
  expect(validators.password('.'))
  expect(validators.password('a'.repeat(1025))).toBe(false)
})

test('projectName success', () => {
  expect(validators.projectName('ai')).toBe(true)
  expect(validators.projectName('aaa')).toBe(true)
  expect(validators.projectName('hello-world')).toBe(true)
  expect(validators.projectName('123-abc')).toBe(true)
})

test('projectName failure', () => {
  expect(validators.projectName('a')).toBe(false)
  expect(validators.projectName('hello_world')).toBe(false)
  expect(validators.projectName('a_bc')).toBe(false)
  expect(validators.projectName('abc.'))
  expect(validators.projectName('abc_123'))
  expect(validators.projectName('ah^23'))
  expect(validators.projectName('Hello-World')).toBe(false)
  expect(validators.projectName('f'.repeat(100))).toBe(false)
})

test('deploymentHash success', () => {
  expect(validators.deploymentHash('abcdefgh')).toBe(true)
  expect(validators.deploymentHash('01234567')).toBe(true)
  expect(validators.deploymentHash('k2l3n6l2')).toBe(true)
})

test('deploymentHash failure', () => {
  expect(validators.deploymentHash('aa')).toBe(false)
  expect(validators.deploymentHash('')).toBe(false)
  expect(validators.deploymentHash('Abcdefgh')).toBe(false)
  expect(validators.deploymentHash('012345678')).toBe(false)
})

test('projectIdentifier success', () => {
  expect(validators.projectIdentifier('username/project-name')).toBe(true)
  expect(validators.projectIdentifier('a/123')).toBe(true)
})

test('projectIdentifier failure', () => {
  expect(validators.projectIdentifier('aaa//0123')).toBe(false)
  expect(validators.projectIdentifier('foo@bar')).toBe(false)
  expect(validators.projectIdentifier('abc/1.23')).toBe(false)
  expect(validators.projectIdentifier('012345678/123@latest')).toBe(false)
  expect(validators.projectIdentifier('foo@dev')).toBe(false)
  expect(validators.projectIdentifier('username/Project-Name')).toBe(false)
  expect(validators.projectIdentifier('_/___')).toBe(false)
})

test('deploymentIdentifier success', () => {
  expect(
    validators.deploymentIdentifier('username/project-name@01234567')
  ).toBe(true)
  expect(validators.deploymentIdentifier('a/123@01234567')).toBe(true)
})

test('deploymentIdentifier failure', () => {
  expect(
    validators.deploymentIdentifier('username/project-name@012345678')
  ).toBe(false)
  expect(validators.deploymentIdentifier('username/project-name@latest')).toBe(
    false
  )
  expect(validators.deploymentIdentifier('username/project-name@dev')).toBe(
    false
  )
  expect(
    validators.deploymentIdentifier('username/Project-Name@01234567')
  ).toBe(false)
  expect(validators.deploymentIdentifier('a/123@0123A567')).toBe(false)
  expect(validators.deploymentIdentifier('_/___@012.4567')).toBe(false)
  expect(validators.deploymentIdentifier('_/___@01234567')).toBe(false)
  expect(validators.deploymentIdentifier('aaa//0123@01234567')).toBe(false)
  expect(validators.deploymentIdentifier('foo@bar@01234567')).toBe(false)
  expect(validators.deploymentIdentifier('abc/1.23@01234567')).toBe(false)
  expect(validators.deploymentIdentifier('012345678/123@latest')).toBe(false)
  expect(validators.deploymentIdentifier('012345678/123@dev')).toBe(false)
  expect(validators.deploymentIdentifier('012345678/123@1.0.1')).toBe(false)
})

test('toolName success', () => {
  expect(validators.toolName('toolName')).toBe(true)
  expect(validators.toolName('_identIFIER0123')).toBe(true)
  expect(validators.toolName('abc_123_foo')).toBe(true)
})

test('toolName failure', () => {
  expect(validators.toolName('ab1.2')).toBe(false)
  expect(validators.toolName('foo-bar')).toBe(false)
  expect(validators.toolName('abc/123')).toBe(false)
})

test('toolPath success', () => {
  expect(validators.toolPath('/foo')).toBe(true)
  expect(validators.toolPath('/')).toBe(true)
  expect(validators.toolPath('/foo/bar/123%20-_abc')).toBe(true)
  expect(validators.toolPath('/foo/BAR/..')).toBe(true)
  expect(validators.toolPath('/api/iconsets/v3/categories')).toBe(true)
})

test('toolPath failure', () => {
  expect(validators.toolPath('')).toBe(false)
  expect(validators.toolPath('foo/bar')).toBe(false)
  expect(validators.toolPath('/foo/bar\\')).toBe(false)
  expect(validators.toolPath('/foo/bar@')).toBe(false)
  expect(validators.toolPath('/foo/bar@abc')).toBe(false)
})
