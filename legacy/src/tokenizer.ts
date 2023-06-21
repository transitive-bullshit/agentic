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

/**
 * Asynchronously retrieves the Byte Pair Encoding (BPE) for a specified Tiktoken encoding.
 *
 * @param encoding - Tiktoken encoding
 * @param options - optional settings for the request
 * @returns promise that resolves to the BPE for the specified encoding
 */
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

/**
 * Asynchronously creates and retrieves a tokenizer for a specified Tiktoken encoding.
 *
 * @param encoding - Tiktoken encoding
 * @param options - optional settings for the request
 * @returns promise resolving to a tokenizer for the specified encoding
 */
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

/**
 * Asynchronously creates and retrieves a tokenizer for a specified Tiktoken model.
 *
 * @param model - name of the Tiktoken model
 * @param options - optional settings for the request
 * @returns promise resolving to a tokenizer for the specified model
 */
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

/**
 * Returns the Tiktoken model name for a OpenAI model name.
 *
 * @param modelName - full OpenAI model name
 * @returns Tiktoken model name
 */
export function getModelNameForTiktoken(modelName: string): TiktokenModel {
  if (modelName.startsWith('gpt-3.5-turbo-16k-')) {
    return 'gpt-3.5-turbo-16k'
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

/**
 * Returns the context size for a given embedding model.
 *
 * @param modelName - optional name of the embedding model. If not provided, returns a default context size.
 * @returns context size for the given embedding model
 */
export function getContextSizeForEmbedding(modelName?: string): number {
  switch (modelName) {
    case 'text-embedding-ada-002':
      return 8191
    default:
      return 2046
  }
}

/**
 * Returns the context size for a given large language model (LLM).
 *
 * @param model - name of the model
 * @returns context size for the model
 */
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

/**
 * Calculates the maximum number of tokens that can be added to a prompt for a given LLM without exceeding the context size limit.
 *
 * @param prompt - prompt string
 * @param modelName - name of the model
 * @returns maximum number of tokens that can be added to the prompt
 */
export async function calculateMaxTokens({
  prompt,
  modelName
}: {
  prompt: string
  modelName: string
}) {
  let numTokens: number
  try {
    const tokenizer = await getTokenizerForModel(modelName)
    numTokens = tokenizer.encode(prompt).length
  } catch (err: any) {
    console.warn(
      `calculateMaxTokens error for model "${modelName}", falling back to approximate count`,
      err.toString()
    )
    // Fallback to approximate calculation if tiktoken is not available:
    numTokens = Math.ceil(prompt.length / 4)
  }

  const maxTokens = getContextSizeForModel(modelName)
  return maxTokens - numTokens
}
