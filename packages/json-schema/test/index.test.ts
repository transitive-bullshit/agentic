import { describe, expect, it } from 'vitest'

import { dereference, validate, type ValidationResult } from '../src/index.js'
import { remotes, suites } from './json-schema-test-suite.js'
import { loadMeta } from './meta-schema.js'
import { unsupportedTests } from './unsupported.js'

const remotesLookup = Object.create(null)
for (const { name, schema } of remotes) {
  dereference(schema, remotesLookup, new URL(name))
}
Object.freeze(remotesLookup)
;(globalThis as any).location = {
  origin: 'https://example.com',
  host: 'example.com',
  hostname: 'example.com',
  pathname: '/',
  search: '',
  hash: ''
}

describe('json-schema', () => {
  const failures: Record<string, Record<string, Record<string, true>>> = {}
  for (const { draft, name, tests: tests0 } of suites) {
    if (name.endsWith('/unknownKeyword')) {
      continue
    }

    describe(name, () => {
      for (const { schema, description: description1, tests } of tests0) {
        const schemaLookup = dereference(schema)

        const supportedTests = tests.filter((test) => {
          return !unsupportedTests[name]?.[description1]?.[test.description]
        })
        if (!supportedTests.length) {
          continue
        }

        describe(description1, () => {
          for (const {
            data,
            valid,
            description: description2,
            debug
          } of tests) {
            if (unsupportedTests[name]?.[description1]?.[description2]) {
              continue
            }
            ;(debug ? it.only : it)(description2, async () => {
              if (debug) {
                // eslint-disable-next-line no-debugger
                debugger
              }
              const metaLookup = await loadMeta()
              const lookup = {
                ...metaLookup,
                ...remotesLookup,
                ...schemaLookup
              }
              let result: ValidationResult | undefined
              try {
                result = validate(data, schema, draft, lookup)
              } catch {}
              if (result?.valid !== valid) {
                failures[name] = failures[name] ?? {}
                failures[name][description1] =
                  failures[name][description1] ?? {}
                failures[name][description1][description2] = true
              }
              expect(result?.valid).to.equal(valid, description2)
            })
          }
        })
      }
    })
  }

  // after(() => console.log(JSON.stringify(failures, null, 2)));
})
