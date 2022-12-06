/// <reference lib="dom" />

// Use `undici` for node.js 16 and 17
// Use `fetch` for node.js >= 18
// Use `fetch` for browsers
// Use `fetch` for all other environments
const fetch =
  globalThis.fetch ??
  ((await import('undici')).fetch as unknown as typeof globalThis.fetch)

export { fetch }
