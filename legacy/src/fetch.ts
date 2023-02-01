/// <reference lib="dom" />

const fetch = globalThis.fetch

if (typeof fetch !== 'function') {
  throw new Error('Invalid environment: global fetch not defined')
}

export { fetch }
