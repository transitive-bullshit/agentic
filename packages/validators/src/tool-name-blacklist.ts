// TODO: if we separate mcp endpoint from REST endpoint, we may be able to have
// tools named `mcp`. would be nice not to impose a blacklist.
export const toolNameBlacklist = new Set([
  // restricted because they are reserved for the platform
  'mcp',
  'sse'
])
