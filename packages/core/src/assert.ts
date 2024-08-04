import is from '@sindresorhus/is'

function assertImpl(value: unknown, message?: string | Error): asserts value {
  if (value) {
    return
  }

  if (is.error(message)) {
    throw message
  }

  throw new Error(message ?? 'Assertion failed')
}

/**
 * Assertion function that defaults to Node.js's `assert` module if it's
 * available, with a basic backup if not.
 */
let assert: (value: unknown, message?: string | Error) => asserts value =
  assertImpl

try {
  // Default to the Node.js assert module if it's available
  const assertImport = await import('node:assert')
  if (assertImport?.default) {
    assert = assertImport.default
  }
} catch {}

export { assert }
