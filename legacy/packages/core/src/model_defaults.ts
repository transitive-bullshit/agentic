import * as types from './types'
import { getEnv, getEnvs } from './env'

/**
 * Returns default options for the OpenAI language model provider.
 *
 * @param opts - user-provided option values
 * @returns default options for the OpenAI language model provider
 */
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
    modelParams: {
      ...getEnvs([
        'OPENAI_TEMPERATURE',
        'OPENAI_MAX_TOKENS',
        'OPENAI_PRESENCE_PENALTY',
        'OPENAI_FREQUENCY_PENALTY',
        'OPENAI_TOP_P',
        'OPENAI_TOP_K',
        'OPENAI_STOP'
      ]),
      ...modelParams
    },
    timeoutMs: 2 * 60000,
    retryConfig: {
      retries: 2,
      strategy: 'heal',
      ...retryConfig
    },
    ...rest
  }
}
