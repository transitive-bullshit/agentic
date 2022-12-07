/// <reference lib="dom" />

// Use `undici` for node.js 16 and 17
// Use `fetch` for node.js >= 18
// Use `fetch` for all other environments, including browsers
// NOTE: The top-level await is removed in a `postbuild` npm script for the
// browser build
const fetch =
  globalThis.fetch ??
  ((await import('undici')).fetch as unknown as typeof globalThis.fetch)

export { fetch }
