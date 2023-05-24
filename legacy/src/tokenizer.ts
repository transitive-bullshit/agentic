import { encoding_for_model } from '@dqbd/tiktoken'

export function getTokenizerForModel(model: string) {
  return encoding_for_model(model as any)
}
