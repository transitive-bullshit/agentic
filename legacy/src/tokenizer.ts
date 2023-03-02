import { get_encoding } from '@dqbd/tiktoken'

// TODO: make this configurable
const tokenizer = get_encoding('cl100k_base')

export function encode(input: string): Uint32Array {
  return tokenizer.encode(input)
}
