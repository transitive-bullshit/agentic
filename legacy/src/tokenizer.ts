import GPT3TokenizerImport from 'gpt3-tokenizer'

const GPT3Tokenizer: typeof GPT3TokenizerImport =
  typeof GPT3TokenizerImport === 'function'
    ? GPT3TokenizerImport
    : (GPT3TokenizerImport as any).default

export const tokenizer = new GPT3Tokenizer({ type: 'gpt3' })

export function encode(input: string): number[] {
  return tokenizer.encode(input).bpe
}
