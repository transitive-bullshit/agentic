import { expect, test } from 'vitest'

import { getIdSchemaForModelType } from '../schemas'
import { createId, idMaxLength, idPrefixMap, type ModelType } from './common'

for (const modelType of Object.keys(idPrefixMap)) {
  test(`${modelType} id`, () => {
    for (let i = 0; i < 100; ++i) {
      const id = createId(modelType as ModelType)
      expect(id.startsWith(idPrefixMap[modelType as ModelType])).toBe(true)
      expect(id.length).toBeLessThanOrEqual(idMaxLength)
      expect(getIdSchemaForModelType(modelType as ModelType).parse(id)).toBe(id)
    }
  })
}
