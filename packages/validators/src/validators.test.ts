import { expect, test } from 'vitest'

import {
  isNamespaceAllowed,
  isToolNameAllowed,
  isValidDeploymentHash,
  isValidDeploymentIdentifier,
  isValidEmail,
  isValidPassword,
  isValidProjectIdentifier,
  isValidProjectSlug,
  isValidToolName,
  isValidUsername
} from './validators'

test('isValidEmail success', () => {
  expect(isValidEmail('t@t.com')).toBe(true)
  expect(isValidEmail('abc@gmail.com')).toBe(true)
  expect(isValidEmail('abc@foo.io')).toBe(true)
})

test('isValidEmail failure', () => {
  expect(isValidEmail('t@t')).toBe(false)
  expect(isValidEmail('abc')).toBe(false)
  expect(isValidEmail('@')).toBe(false)
})

test('isNamespaceAllowed', () => {
  expect(isNamespaceAllowed('foo')).toBe(true)
  expect(isNamespaceAllowed('foo-bar')).toBe(true)
  expect(isNamespaceAllowed('vercel')).toBe(false)
  expect(isNamespaceAllowed('ai')).toBe(false)
  expect(isNamespaceAllowed('fuck')).toBe(false)
})

test('isValidUsername success', () => {
  expect(isValidUsername('z')).toBe(true)
  expect(isValidUsername('abc')).toBe(true)
  expect(isValidUsername('abc-123')).toBe(true)
  expect(isValidUsername('foo123')).toBe(true)
  expect(isValidUsername('asldfkjasldkfjlaksdfjlkas')).toBe(true)
  expect(isValidUsername('a'.repeat(256))).toBe(true)
})

test('isValidUsername failure (invalid)', () => {
  expect(isValidUsername('ab%')).toBe(false)
  expect(isValidUsername('.')).toBe(false)
  expect(isValidUsername('$')).toBe(false)
  expect(isValidUsername('abc_123')).toBe(false)
  expect(isValidUsername('Foo123')).toBe(false)
  expect(isValidUsername('a'.repeat(257))).toBe(false)
})

test('isValidPassword success', () => {
  expect(isValidPassword('abc')).toBe(true)
  expect(isValidPassword('password')).toBe(true)
  expect(isValidPassword('asldfkjasldkfjlaksdfjlkas')).toBe(true)
})

test('isValidPassword failure', () => {
  expect(isValidPassword('aa')).toBe(false)
  expect(isValidPassword('.'))
  expect(isValidPassword('a'.repeat(1025))).toBe(false)
})

test('isValidProjectSlug success', () => {
  expect(isValidProjectSlug('a')).toBe(true)
  expect(isValidProjectSlug('ai')).toBe(true)
  expect(isValidProjectSlug('aaa')).toBe(true)
  expect(isValidProjectSlug('hello-world')).toBe(true)
  expect(isValidProjectSlug('123-abc')).toBe(true)
  expect(isValidProjectSlug('f'.repeat(256))).toBe(true)
})

test('isValidProjectSlug failure', () => {
  expect(isValidProjectSlug('hello_world')).toBe(false)
  expect(isValidProjectSlug('a_bc')).toBe(false)
  expect(isValidProjectSlug('abc.')).toBe(false)
  expect(isValidProjectSlug('abc_123')).toBe(false)
  expect(isValidProjectSlug('ah^23')).toBe(false)
  expect(isValidProjectSlug('Hello-World')).toBe(false)
  expect(isValidProjectSlug('f'.repeat(257))).toBe(false)
})

test('isValidDeploymentHash success', () => {
  expect(isValidDeploymentHash('abcdefgh')).toBe(true)
  expect(isValidDeploymentHash('01234567')).toBe(true)
  expect(isValidDeploymentHash('k2l3n6l2')).toBe(true)
})

test('isValidDeploymentHash failure', () => {
  expect(isValidDeploymentHash('aa')).toBe(false)
  expect(isValidDeploymentHash('')).toBe(false)
  expect(isValidDeploymentHash('Abcdefgh')).toBe(false)
  expect(isValidDeploymentHash('012345678')).toBe(false)
})

test('isValidProjectIdentifier success', () => {
  expect(isValidProjectIdentifier('@username/project-slug')).toBe(true)
  expect(isValidProjectIdentifier('@a/123')).toBe(true)
})

test('isValidProjectIdentifier failure', () => {
  expect(isValidProjectIdentifier('')).toBe(false)
  expect(isValidProjectIdentifier()).toBe(false)
  expect(isValidProjectIdentifier('foo')).toBe(false)
  expect(isValidProjectIdentifier('@foo')).toBe(false)
  expect(isValidProjectIdentifier('@foo//bar')).toBe(false)
  expect(isValidProjectIdentifier('@@foo/bar')).toBe(false)
  expect(isValidProjectIdentifier('@foo/bar/baz')).toBe(false)
  expect(isValidProjectIdentifier('@foo/bar/tool')).toBe(false)
  expect(isValidProjectIdentifier('@aaa//0123')).toBe(false)
  expect(isValidProjectIdentifier('@foo@bar')).toBe(false)
  expect(isValidProjectIdentifier('@abc/1.23')).toBe(false)
  expect(isValidProjectIdentifier('@012345678/123@latest')).toBe(false)
  expect(isValidProjectIdentifier('@foo@dev')).toBe(false)
  expect(isValidProjectIdentifier('@username/Project-Slug')).toBe(false)
  expect(isValidProjectIdentifier('@_/___')).toBe(false)
})

test('isValidDeploymentIdentifier success', () => {
  expect(isValidDeploymentIdentifier('@username/project-slug@01234567')).toBe(
    true
  )
  expect(isValidDeploymentIdentifier('@username/project-slug@latest')).toBe(
    true
  )
  expect(isValidDeploymentIdentifier('@username/project-slug@dev')).toBe(true)
  expect(isValidDeploymentIdentifier('@username/project-slug@0.0.1')).toBe(true)
  expect(isValidDeploymentIdentifier('@username/project-slug')).toBe(true)
  expect(isValidDeploymentIdentifier('@a/123@01234567')).toBe(true)
  expect(isValidDeploymentIdentifier('@a/123@0.1.0')).toBe(true)
  expect(isValidDeploymentIdentifier('@a/123@latest')).toBe(true)
  expect(isValidDeploymentIdentifier('@a/123@dev')).toBe(true)
  expect(isValidDeploymentIdentifier('@a/123')).toBe(true)
})

test('isValidDeploymentIdentifier failure', () => {
  expect(isValidDeploymentIdentifier('')).toBe(false)
  expect(isValidDeploymentIdentifier()).toBe(false)
  expect(isValidDeploymentIdentifier('foo')).toBe(false)
  expect(isValidDeploymentIdentifier('foo/bar')).toBe(false)
  expect(isValidDeploymentIdentifier('@@foo/bar')).toBe(false)
  expect(isValidDeploymentIdentifier('@foo/bar/baz')).toBe(false)
  expect(isValidDeploymentIdentifier('@foo/bar/tool')).toBe(false)
  expect(isValidDeploymentIdentifier('@a/123@0123A567/foo')).toBe(false)
  expect(isValidDeploymentIdentifier('@_/___@012.4567')).toBe(false)
  expect(isValidDeploymentIdentifier('@_/___@01234567')).toBe(false)
  expect(isValidDeploymentIdentifier('@aaa//0123@01234567')).toBe(false)
  expect(isValidDeploymentIdentifier('@foo@bar@01234567')).toBe(false)
  expect(isValidDeploymentIdentifier('@abc/1.23@01234567')).toBe(false)
  expect(isValidDeploymentIdentifier('012345678/123@latest')).toBe(false)
  expect(isValidDeploymentIdentifier('012345678/123@dev')).toBe(false)
  expect(isValidDeploymentIdentifier('012345678/123@1.0.1')).toBe(false)
})

test('isValidToolName success', () => {
  expect(isValidToolName('tool_name')).toBe(true)
  expect(isValidToolName('toolName')).toBe(true)
  expect(isValidToolName('_identIFIER0123')).toBe(true)
  expect(isValidToolName('abc_123_foo')).toBe(true)
  expect(isValidToolName('search_google')).toBe(true)
  expect(isValidToolName('searchGoogle')).toBe(true)
  expect(isValidToolName('searchGoogle2')).toBe(true)
  expect(isValidToolName('_searchGoogle')).toBe(true)
})

test('isValidToolName failure', () => {
  expect(isValidToolName('ab1.2')).toBe(false)
  expect(isValidToolName('foo-bar')).toBe(false)
  expect(isValidToolName('abc/123')).toBe(false)
  expect(isValidToolName('search_google ')).toBe(false)
  expect(isValidToolName('search-google')).toBe(false)
  expect(
    isValidToolName(
      'too_long_too_long_too_long_too_long_too_long_too_long_too_long_to'
    )
  ).toBe(false)
})

test('isToolNameAllowed', () => {
  expect(isToolNameAllowed('foo')).toBe(true)
  expect(isToolNameAllowed('tool_name')).toBe(true)
  expect(isToolNameAllowed('searchGoogle')).toBe(true)
  expect(isToolNameAllowed('mcp')).toBe(false)
  expect(isToolNameAllowed('sse')).toBe(false)
  expect(isToolNameAllowed()).toBe(false)
  expect(isToolNameAllowed('')).toBe(false)
})
