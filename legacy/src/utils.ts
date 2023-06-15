import { customAlphabet, urlAlphabet } from 'nanoid'

import * as types from './types'

/**
 * Extracts the first JSON object string from a given string.
 *
 * @param text - string from which to extract the JSON object
 * @returns extracted JSON object string, or `undefined` if no JSON object is found
 */
export function extractJSONObjectFromString(text: string): string | undefined {
  return text.match(/\{([^}]|\n)*\}/gm)?.[0]
}

/**
 * Extracts the first JSON array string from a given string.
 *
 * @param text - string from which to extract the JSON array
 * @returns extracted JSON array string, or `undefined` if no JSON array is found
 */
export function extractJSONArrayFromString(text: string): string | undefined {
  return text.match(/\[([^\]]|\n)*\]/gm)?.[0]
}

/**
 * Pauses the execution of a function for a specified time.
 *
 * @param ms - number of milliseconds to pause
 * @returns promise that resolves after the specified number of milliseconds
 */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * A default ID generator function that uses a custom alphabet based on URL safe symbols.
 */
export const defaultIDGeneratorFn: types.IDGeneratorFunction =
  customAlphabet(urlAlphabet)

const taskNameRegex = /^[a-zA-Z_][a-zA-Z0-9_-]{0,63}$/
export function isValidTaskIdentifier(id: string): boolean {
  return !!id && taskNameRegex.test(id)
}

/**
 * Chunks a string into an array of chunks.
 *
 * @param text - string to chunk
 * @param maxLength - maximum length of each chunk
 * @returns array of chunks
 */
export const chunkString = (text: string, maxLength: number) => {
  const words = text.split(' ')
  const chunks: string[] = []
  let chunk = ''

  for (const word of words) {
    if (word.length > maxLength) {
      // Truncate the word if it's too long and indicate that it was truncated:
      chunks.push(word.substring(0, maxLength - 3) + '...')
    } else if ((chunk + word + 1).length > maxLength) {
      // +1 accounts for the space between words
      chunks.push(chunk.trim())
      chunk = word
    } else {
      chunk += (chunk ? ' ' : '') + word
    }
  }

  if (chunk) {
    chunks.push(chunk.trim())
  }

  return chunks
}
