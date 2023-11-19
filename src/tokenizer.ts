import { get_encoding } from '@dqbd/tiktoken'

import { ChatCompletionRequestMessageContentImageDetail } from './types'

// TODO: make this configurable
const tokenizer = get_encoding('cl100k_base')

export function encode(input: string): Uint32Array {
  return tokenizer.encode(input)
}

export function getTokensImage(
  width: number,
  height: number,
  detail: ChatCompletionRequestMessageContentImageDetail
) {
  if (detail === 'low') {
    return 85
  }

  // https://openai.com/pricing
  // https://platform.openai.com/docs/guides/vision
  const maxLength = Math.max(width, height)
  let percentage = 0

  if (maxLength >= 2048) {
    percentage = 2048 / maxLength
    width = Math.ceil(width * percentage)
    height = Math.ceil(height * percentage)
  }

  const minLength = Math.min(width, height)

  if (minLength >= 1024) {
    percentage = 768 / minLength
    width = Math.ceil(width * percentage)
    height = Math.ceil(height * percentage)
  }

  // 下面计算方式有问题，不清楚Resize 是怎么计算的
  const h = Math.ceil(height / 512)
  const w = Math.ceil(width / 512)
  const n = w * h
  const total = 85 + 170 * n

  return total
}
