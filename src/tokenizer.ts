import { encoding_for_model } from '@dqbd/tiktoken'

// TODO: make this configurable
const tokenizer = encoding_for_model('text-davinci-003')

export function encode(input: string): Uint32Array {
  return tokenizer.encode(input)
}
