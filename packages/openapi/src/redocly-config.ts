import {
  type Config as RedoclyConfig,
  createConfig
} from '@redocly/openapi-core'

// Cache the default Redocly config to avoid re-creating it on every call
let _defaultRedoclyConfig: RedoclyConfig | undefined

export async function getDefaultRedoclyConfig(): Promise<RedoclyConfig> {
  if (!_defaultRedoclyConfig) {
    _defaultRedoclyConfig = await createConfig(
      {
        rules: {
          // throw error on duplicate operationIds
          'operation-operationId-unique': { severity: 'error' }
        }
      },
      { extends: ['minimal'] }
    )
  }

  return _defaultRedoclyConfig
}
