import ky from 'ky'
import pMap from 'p-map'

import { dereference, type Schema } from '../src/index'

let lookup: Record<string, Schema> | undefined

export async function loadMeta() {
  if (lookup) {
    return lookup
  }

  lookup = Object.create({})
  const ids = [
    'http://json-schema.org/draft-04/schema',
    'http://json-schema.org/draft-07/schema',
    'https://json-schema.org/draft/2019-09/schema',
    'https://json-schema.org/draft/2019-09/meta/core',
    'https://json-schema.org/draft/2019-09/meta/applicator',
    'https://json-schema.org/draft/2019-09/meta/validation',
    'https://json-schema.org/draft/2019-09/meta/meta-data',
    'https://json-schema.org/draft/2019-09/meta/format',
    'https://json-schema.org/draft/2019-09/meta/content',
    'https://json-schema.org/draft/2020-12/schema',
    'https://json-schema.org/draft/2020-12/meta/core',
    'https://json-schema.org/draft/2020-12/meta/applicator',
    'https://json-schema.org/draft/2020-12/meta/validation',
    'https://json-schema.org/draft/2020-12/meta/meta-data',
    'https://json-schema.org/draft/2020-12/meta/format-annotation',
    'https://json-schema.org/draft/2020-12/meta/content',
    'https://json-schema.org/draft/2020-12/meta/unevaluated'
  ]

  await pMap(
    ids,
    async (id) => {
      const schema = await ky.get(id).json<Schema>()
      dereference(schema, lookup)
    },
    {
      concurrency: 4
    }
  )

  Object.freeze(lookup)
  return lookup
}
