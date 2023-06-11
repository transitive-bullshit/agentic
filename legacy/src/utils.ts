import { customAlphabet, urlAlphabet } from 'nanoid'

import * as types from './types'

export const extractJSONObjectFromString = (text: string): string | undefined =>
  text.match(/\{(.|\n)*\}/gm)?.[0]

export const extractJSONArrayFromString = (text: string): string | undefined =>
  text.match(/\[(.|\n)*\]/gm)?.[0]

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const defaultIDGeneratorFn: types.IDGeneratorFunction =
  customAlphabet(urlAlphabet)
