import * as types from './types'
import { getEnv } from './env'

export function openaiModelDefaults(
  opts: Pick<
    types.BaseLLMOptions,
    'provider' | 'model' | 'modelParams' | 'timeoutMs' | 'retryConfig'
  >
) {
  const { retryConfig, modelParams, ...rest } = opts
  return {
    provider: 'openai',
    model:
      getEnv('OPENAI_MODEL') ?? getEnv('OPENAI_DEFAULT_MODEL', 'gpt-3.5-turbo'),
    modelParams: {},
    timeoutMs: 2 * 60000,
    retryConfig: {
      retries: 2,
      strategy: 'heal',
      ...retryConfig
    },
    ...rest
  }
}
