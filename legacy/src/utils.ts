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

/**
 * Chunk a string into an array of strings of a given length
 *
 * @param text - string to chunk
 * @param length - maximum length of each chunk
 * @returns array of strings
 */
export const chunkString = (text: string, length: number) => {
  const words = text.split(' ')
  const chunks: string[] = []
  let chunk = ''

  for (const word of words) {
    if (word.length > length) {
      // Truncate the word if it's too long and indicate that it was truncated:
      chunks.push(word.substring(0, length - 3) + '...')
    }

    if ((chunk + word).length > length) {
      chunks.push(chunk.trim())
      chunk = word
    } else {
      chunk += ' ' + word
    }
  }

  if (chunk) {
    chunks.push(chunk.trim())
  }

  return chunks
}
