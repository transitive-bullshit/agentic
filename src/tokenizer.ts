import { Tiktoken } from 'js-tiktoken/lite'
import cl100k_base from 'js-tiktoken/ranks/cl100k_base'

// TODO: make this configurable
const encoding = new Tiktoken(cl100k_base)

export function encode(input: string): Uint32Array {
  return new Uint32Array(encoding.encode(input))
}
