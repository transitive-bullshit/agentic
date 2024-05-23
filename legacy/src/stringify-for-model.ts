import type { Jsonifiable } from 'type-fest'

/**
 * Stringifies a JSON value in a way that's optimized for use with LLM prompts.
 */
export function stringifyForModel(jsonObject?: Jsonifiable): string {
  if (jsonObject === undefined) {
    return ''
  }

  if (typeof jsonObject === 'string') {
    return jsonObject
  }

  return JSON.stringify(jsonObject, null, 0)
}
