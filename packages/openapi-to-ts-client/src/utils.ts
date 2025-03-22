import type SwaggerParser from '@apidevtools/swagger-parser'
import type { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types'
import { assert } from '@agentic/core'
import {
  type JsonSchema,
  jsonSchemaToZod as jsonSchemaToZodImpl
} from 'json-schema-to-zod'
import * as prettier from 'prettier'

export function prettify(source: string): Promise<string> {
  return prettier.format(source, {
    parser: 'typescript',
    semi: false,
    singleQuote: true,
    jsxSingleQuote: true,
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: 'always',
    trailingComma: 'none'
  })
}

export function titleCase(identifier: string): string {
  return `${identifier.slice(0, 1).toUpperCase()}${identifier.slice(1)}`
}

export function unTitleCase(identifier: string): string {
  return `${identifier.slice(0, 1).toLowerCase()}${identifier.slice(1)}`
}

export function getAndResolve<T extends object = object>(
  obj: any,
  keys: string[],
  refs: SwaggerParser.$Refs,
  resolved?: Set<string>,
  depth = 0,
  maxDepth = 0
): T | null {
  if (obj === undefined) return null
  if (typeof obj !== 'object') return null

  if (!keys.length) {
    return dereference(obj, refs, resolved, depth, maxDepth) as T
  }

  if (obj.$ref) {
    const derefed = refs.get(obj.$ref)
    resolved?.add(obj.$ref)
    if (!derefed) {
      return null
    }
    obj = derefed
  }

  const key = keys[0]!
  const value = obj[key]
  keys = keys.slice(1)
  if (value === undefined) {
    return null
  }

  return getAndResolve<T>(value, keys, refs, resolved, depth, maxDepth)
}

export function dereferenceFull<T extends object = object>(
  obj: T,
  refs: SwaggerParser.$Refs,
  resolved?: Set<string>
): Exclude<T, OpenAPIV3.ReferenceObject | OpenAPIV3_1.ReferenceObject> {
  return dereference(obj, refs, resolved, 0, Number.POSITIVE_INFINITY) as any
}

export function dereference<T extends object = object>(
  obj: T,
  refs: SwaggerParser.$Refs,
  resolved?: Set<string>,
  depth = 0,
  maxDepth = 1
): T {
  if (!obj) return obj

  if (depth >= maxDepth) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      dereference(item, refs, resolved, depth + 1, maxDepth)
    ) as T
  } else if (typeof obj === 'object') {
    if ('$ref' in obj) {
      const ref = obj.$ref as string
      const derefed = refs.get(ref)
      if (!derefed) {
        return obj
      }
      resolved?.add(ref)
      derefed.title = ref.split('/').pop()!
      return dereference(derefed, refs, resolved, depth + 1, maxDepth)
    } else {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
          key,
          dereference(value, refs, resolved, depth + 1, maxDepth)
        ])
      ) as T
    }
  } else {
    return obj
  }
}

export function jsonSchemaToZod(
  schema: JsonSchema,
  {
    name,
    type
  }: {
    name?: string
    type?: string
  } = {}
): string {
  return jsonSchemaToZodImpl(schema, {
    name,
    module: 'esm',
    withJsdocs: true,
    type: type ?? true,
    noImport: true,
    parserOverride: (schema, _refs) => {
      if ('$ref' in schema) {
        const ref = schema.$ref as string
        if (!ref) return

        const name = getComponentName(ref)
        if (!name) return

        return `${name}Schema`
      }
    }
  })
}

const reservedWords = new Set([
  'Error',
  'Class',
  'Object',
  'interface',
  'type',
  'default',
  'switch',
  'for',
  'break',
  'case',
  'if',
  'else',
  'while',
  'do',
  'for',
  'return',
  'continue',
  'function',
  'console',
  'window',
  'global',
  'import',
  'export',
  'namespace',
  'using',
  'require',
  'module',
  'process',
  'async',
  'await',
  'const',
  'let',
  'var',
  'void',
  'undefined',
  'abstract',
  'extends',
  'implements',
  'private',
  'protected',
  'public',
  'Infinity',
  'Nan',
  'Math',
  'Date',
  'RegExp',
  'JSON',
  'Buffer',
  'Promise',
  'Symbol',
  'Map',
  'Set',
  'WeakMap',
  'WeakSet',
  'Array',
  'Object',
  'Boolean',
  'Number',
  'String',
  'Function',
  'Symbol'
])

export function getComponentName(ref: string) {
  const name0 = ref.split('/').pop()!
  assert(name0, `Invalid ref name ${ref}`)

  const name1 = titleCase(name0)
  assert(name1, `Invalid ref name ${ref}`)

  if (reservedWords.has(name1)) {
    return `${name1}Type`
  }

  return name1
}

export function getOperationParamsName(
  operationName: string,
  schemas?: Record<string, string>
) {
  const name = `${titleCase(operationName)}Params`
  if (!schemas) return name

  let tempName = name
  let index = 2
  while (schemas[tempName]) {
    tempName = `${name}${index}`
    ++index
  }

  return tempName
}

export function getOperationResponseName(
  operationName: string,
  schemas?: Record<string, string>
) {
  const name = `${titleCase(operationName)}Response`
  if (!schemas) return name

  let tempName = name
  let index = 2
  while (schemas[tempName]) {
    tempName = `${name}${index}`
    ++index
  }

  return tempName
}
