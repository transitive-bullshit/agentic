import {
  Tiktoken,
  TiktokenBPE,
  TiktokenEncoding,
  TiktokenModel,
  getEncodingNameForModel
} from 'js-tiktoken/lite'
import ky from 'ky'
import pMemoize from 'p-memoize'

export interface Tokenizer {
  encode(
    text: string,
    options?: {
      allowedSpecial?: Array<string> | 'all'
      disallowedSpecial?: Array<string> | 'all'
    }
  ): number[]

  decode(tokens: number[]): string
}

export class TiktokenTokenizer implements Tokenizer {
  protected _tiktoken: Tiktoken

  constructor(tiktoken: Tiktoken) {
    this._tiktoken = tiktoken
  }

  encode(
    text: string,
    options?: {
      allowedSpecial?: Array<string> | 'all'
      disallowedSpecial?: Array<string> | 'all'
    }
  ): number[] {
    return this._tiktoken.encode(
      text,
      options?.allowedSpecial,
      options?.disallowedSpecial
    )
  }

  decode(tokens: number[]): string {
    return this._tiktoken.decode(tokens)
  }
}

export const getTiktokenBPE = pMemoize(getTiktokenBPEImpl)

async function getTiktokenBPEImpl(
  encoding: TiktokenEncoding,
  {
    signal,
    timeoutMs = 30000
  }: {
    signal?: AbortSignal
    timeoutMs?: number
  } = {}
) {
  return ky(`https://tiktoken.pages.dev/js/${encoding}.json`, {
    signal,
    timeout: timeoutMs
  }).json<TiktokenBPE>()
}

export async function getTokenizerForEncoding(
  encoding: TiktokenEncoding,
  options?: {
    signal?: AbortSignal
    timeoutMs?: number
    extendedSpecialTokens?: Record<string, number>
  }
) {
  const tiktokenBPE = await getTiktokenBPE(encoding, options)
  const tiktoken = new Tiktoken(tiktokenBPE, options?.extendedSpecialTokens)
  return new TiktokenTokenizer(tiktoken)
}

export async function getTokenizerForModel(
  model: string,
  options?: {
    signal?: AbortSignal
    timeoutMs?: number
    extendedSpecialTokens?: Record<string, number>
  }
) {
  const modelName = getModelNameForTiktoken(model)
  const encoding = getEncodingNameForModel(modelName)
  return getTokenizerForEncoding(encoding, options)
}

export function getModelNameForTiktoken(modelName: string): TiktokenModel {
  if (modelName.startsWith('gpt-3.5-turbo-16k-')) {
    // TODO: remove this once the model is added to tiktoken
    return 'gpt-3.5-turbo-16k' as TiktokenModel
  }

  if (modelName.startsWith('gpt-3.5-turbo-')) {
    return 'gpt-3.5-turbo'
  }

  if (modelName.startsWith('gpt-4-32k-')) {
    return 'gpt-4-32k'
  }

  if (modelName.startsWith('gpt-4-')) {
    return 'gpt-4'
  }

  return modelName as TiktokenModel
}

export function getContextSizeForEmbedding(modelName?: string): number {
  switch (modelName) {
    case 'text-embedding-ada-002':
      return 8191
    default:
      return 2046
  }
}

export function getContextSizeForModel(model: string): number {
  const modelName = getModelNameForTiktoken(model)

  switch (modelName) {
    case 'gpt-3.5-turbo-16k' as TiktokenModel:
      return 16384

    case 'gpt-3.5-turbo':
      return 4096

    case 'gpt-4-32k':
      return 32768

    case 'gpt-4':
      return 8192

    case 'text-davinci-003':
      return 4097

    case 'text-curie-001':
      return 2048

    case 'text-babbage-001':
      return 2048

    case 'text-ada-001':
      return 2048

    case 'code-davinci-002':
      return 8000

    case 'code-cushman-001':
      return 2048

    default:
      return 4097
  }
}

export async function calculateMaxTokens({
  prompt,
  modelName
}: {
  prompt: string
  modelName: string
}) {
  // fallback to approximate calculation if tiktoken is not available
  let numTokens = Math.ceil(prompt.length / 4)

  try {
    const tokenizer = await getTokenizerForModel(modelName)
    numTokens = tokenizer.encode(prompt).length
  } catch (err: any) {
    console.warn(
      `calculateMaxTokens error for model "${modelName}", falling back to approximate count`,
      err.toString()
    )
  }

  const maxTokens = getContextSizeForModel(modelName)
  return maxTokens - numTokens
}
