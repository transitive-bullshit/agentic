/// <reference lib="dom" />

// Use `fetch` for node.js >= 18
// Use `fetch` for all other environments, including browsers
const fetch = globalThis.fetch

if (typeof fetch !== 'function') {
  throw new Error(
    'Invalid environment: global fetch not defined; `chatgpt` requires Node.js >= 18 at the moment due to Cloudflare protections'
  )
}

export { fetch }
