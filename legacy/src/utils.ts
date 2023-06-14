import { customAlphabet, urlAlphabet } from 'nanoid'

import * as types from './types'

export function extractJSONObjectFromString(text: string): string | undefined {
  return text.match(/\{(.|\n)*\}/gm)?.[0]
}

export function extractJSONArrayFromString(text: string): string | undefined {
  return text.match(/\[(.|\n)*\]/gm)?.[0]
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const defaultIDGeneratorFn: types.IDGeneratorFunction =
  customAlphabet(urlAlphabet)

const taskNameRegex = /^[a-zA-Z_][a-zA-Z0-9_-]{0,63}$/
export function isValidTaskIdentifier(id: string): boolean {
  return !!id && taskNameRegex.test(id)
}
