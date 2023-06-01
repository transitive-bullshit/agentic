import { getEncoding, getEncodingNameForModel } from 'js-tiktoken'

export function getTokenizerForModel(model: string) {
  const encodingName = getEncodingNameForModel(model as any)
  return getEncoding(encodingName)
}
