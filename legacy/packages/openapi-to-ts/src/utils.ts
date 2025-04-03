import type SwaggerParser from '@apidevtools/swagger-parser'
import type { IJsonSchema, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types'
import { assert } from '@agentic/core'
import camelCaseImpl from 'camelcase'
import {
  type JsonSchema,
  jsonSchemaToZod as jsonSchemaToZodImpl,
  type ParserOverride
} from 'json-schema-to-zod'
import { format as prettierFormat } from 'prettier'

export function prettify(source: string): Promise<string> {
  return prettierFormat(source, {
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

export function pascalCase(identifier: string): string {
  return camelCaseImpl(identifier, { pascalCase: true })
}

export function camelCase(identifier: string): string {
  return camelCaseImpl(identifier)
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
  maxDepth = 1,
  visited = new Set<string>()
): T {
  if (!obj) return obj

  if (depth >= maxDepth) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      dereference(item, refs, resolved, depth + 1, maxDepth, visited)
    ) as T
  } else if (typeof obj === 'object') {
    if ('$ref' in obj) {
      const ref = obj.$ref as string
      if (visited?.has(ref)) {
        return obj
      }
      visited?.add(ref)
      const derefed = refs.get(ref)
      assert(derefed, `Invalid schema: $ref not found for ${ref}`)
      resolved?.add(ref)
      derefed.title ??= ref.split('/').pop()!
      return dereference(derefed, refs, resolved, depth + 1, maxDepth, visited)
    } else {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
          key,
          dereference(value, refs, resolved, depth + 1, maxDepth, visited)
        ])
      ) as T
    }
  } else {
    return obj
  }
}

function createParserOverride({
  type,
  withJsdocs
}: {
  type?: string
  withJsdocs: boolean
}): ParserOverride {
  const jsonSchemaToZodParserOverride: ParserOverride = (schema, _refs) => {
    if ('nullable' in schema && schema.nullable) {
      delete schema.nullable
    }

    if ('$ref' in schema) {
      const ref = schema.$ref as string
      assert(ref, `Invalid schema: $ref not found for ${schema.$ref}`)

      const name = getComponentDisplayName(ref)
      if (type === name) {
        // TODO: Support recursive types.
        return `\n// TODO: Support recursive types for \`${name}Schema\`.\nz.any()`
      }

      return `${name}Schema`
    } else if (schema.oneOf) {
      const { oneOf, ...partialSchema } = schema

      // Replace oneOf with anyOf because `json-schema-to-zod` treats oneOf
      // with a complicated `z.any().superRefine(...)` which we'd like messes
      // up the resulting types.
      const newSchema = {
        ...partialSchema,
        anyOf: oneOf
      }

      const res = jsonSchemaToZodImpl(newSchema, {
        withJsdocs,
        parserOverride: jsonSchemaToZodParserOverride
      })

      return res
    }
  }

  return jsonSchemaToZodParserOverride
}

export function jsonSchemaToZod(
  schema: JsonSchema,
  {
    name,
    type,
    withJsdocs = true
  }: {
    name?: string
    type?: string
    withJsdocs?: boolean
  } = {}
): string {
  return jsonSchemaToZodImpl(schema, {
    name,
    module: 'esm',
    withJsdocs,
    type: type ?? true,
    noImport: true,
    parserOverride: createParserOverride({ type, withJsdocs })
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
  const name = ref.split('/').pop()!
  assert(name, `Invalid ref name ${ref}`)

  return name
}

export function getComponentDisplayName(ref: string) {
  const name0 = getComponentName(ref)
  const name1 = pascalCase(name0)
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
  const name = `${pascalCase(operationName)}Params`
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
  const name = `${pascalCase(operationName)}Response`
  if (!schemas) return name

  let tempName = name
  let index = 2
  while (schemas[tempName]) {
    tempName = `${name}${index}`
    ++index
  }

  return tempName
}

export function naiveMergeJSONSchemas(...schemas: IJsonSchema[]): IJsonSchema {
  const result: any = {}

  for (const ischema of schemas) {
    const schema = ischema as any
    const arrayKeys: string[] = []
    const objectKeys: string[] = []

    for (const [key, value] of Object.entries(schema)) {
      if (Array.isArray(value)) {
        arrayKeys.push(key)
      } else if (typeof value === 'object') {
        objectKeys.push(key)
      } else {
        result[key] = value
      }
    }

    for (const key of arrayKeys) {
      result[key] = [...(result[key] ?? []), ...(schema[key] ?? [])]
    }

    for (const key of objectKeys) {
      result[key] = { ...result[key], ...schema[key] }
    }
  }

  return result as IJsonSchema
}

export function getDescription(description?: string): string | undefined {
  if (!description) return undefined

  if (!/[!.?]$/.test(description)) {
    description += '.'
  }

  return description.replaceAll('/*', '\\/\\*').replaceAll('*/', '\\*\\/')
}
