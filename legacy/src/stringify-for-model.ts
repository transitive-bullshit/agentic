import type { Jsonifiable } from 'type-fest'

/**
 * Stringifies a JSON value in a way that's optimized for use with LLM prompts.
 *
 * This is intended to be used with `function` and `tool` arguments and responses.
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
