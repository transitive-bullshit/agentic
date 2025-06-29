/**
 * This file is forked from: https://github.com/kogosoftwarellc/open-api/tree/main/packages/openapi-jsonschema-parameters
 *
 * Several fixes have been applied.
 *
 * The original code is licensed under the MIT license.
 */

import { type IJsonSchema, type OpenAPI } from 'openapi-types'

export interface OpenAPIParametersAsJSONSchema {
  body?: IJsonSchema
  formData?: IJsonSchema
  headers?: IJsonSchema
  path?: IJsonSchema
  query?: IJsonSchema
  cookie?: IJsonSchema
}

const VALIDATION_KEYWORDS = new Set([
  'additionalItems',
  'default',
  'example',
  'description',
  'enum',
  'examples',
  'exclusiveMaximum',
  'exclusiveMinimum',
  'format',
  'items',
  'maxItems',
  'maxLength',
  'maximum',
  'minItems',
  'minLength',
  'minimum',
  'multipleOf',
  'pattern',
  'title',
  'type',
  'uniqueItems'
])

const SUBSCHEMA_KEYWORDS = [
  'additionalItems',
  'items',
  'contains',
  'additionalProperties',
  'propertyNames',
  'not'
]

const SUBSCHEMA_ARRAY_KEYWORDS = ['items', 'allOf', 'anyOf', 'oneOf']

const SUBSCHEMA_OBJECT_KEYWORDS = [
  'definitions',
  'properties',
  'patternProperties',
  'dependencies'
]

export function convertParametersToJSONSchema(
  parameters: OpenAPI.Parameters
): OpenAPIParametersAsJSONSchema {
  const parametersSchema: OpenAPIParametersAsJSONSchema = {}
  const bodySchema = getBodySchema(parameters)
  const formDataSchema = getSchema(parameters, 'formData')
  const headerSchema = getSchema(parameters, 'header')
  const pathSchema = getSchema(parameters, 'path')
  const querySchema = getSchema(parameters, 'query')
  const cookieSchema = getSchema(parameters, 'cookie')

  if (bodySchema) {
    parametersSchema.body = bodySchema
  }

  if (formDataSchema) {
    parametersSchema.formData = formDataSchema
  }

  if (headerSchema) {
    parametersSchema.headers = headerSchema
  }

  if (pathSchema) {
    parametersSchema.path = pathSchema
  }

  if (querySchema) {
    parametersSchema.query = querySchema
  }

  if (cookieSchema) {
    parametersSchema.cookie = cookieSchema
  }

  return parametersSchema
}

function copyValidationKeywords(src: any) {
  const dst: any = {}
  for (let i = 0, keys = Object.keys(src), len = keys.length; i < len; i++) {
    const keyword = keys[i]
    if (!keyword) continue

    if (VALIDATION_KEYWORDS.has(keyword) || keyword.slice(0, 2) === 'x-') {
      dst[keyword] = src[keyword]
    }
  }
  return dst
}

function handleNullable(schema: IJsonSchema) {
  return { anyOf: [schema, { type: 'null' }] }
}

function handleNullableSchema(schema: any) {
  if (typeof schema !== 'object' || schema === null) {
    return schema
  }

  const newSchema = { ...schema }

  for (const keyword of SUBSCHEMA_KEYWORDS) {
    if (
      typeof schema[keyword] === 'object' &&
      schema[keyword] !== null &&
      !Array.isArray(schema[keyword])
    ) {
      newSchema[keyword] = handleNullableSchema(schema[keyword])
    }
  }

  for (const keyword of SUBSCHEMA_ARRAY_KEYWORDS) {
    if (Array.isArray(schema[keyword])) {
      newSchema[keyword] = schema[keyword].map(handleNullableSchema)
    }
  }

  for (const keyword of SUBSCHEMA_OBJECT_KEYWORDS) {
    if (typeof schema[keyword] === 'object' && schema[keyword] !== null) {
      newSchema[keyword] = { ...schema[keyword] }
      for (const prop of Object.keys(schema[keyword])) {
        newSchema[keyword][prop] = handleNullableSchema(schema[keyword][prop])
      }
    }
  }

  delete newSchema.$ref

  if (schema.nullable) {
    delete newSchema.nullable
    return handleNullable(newSchema)
  }
  return newSchema
}

function getBodySchema(parameters: any[]) {
  let bodySchema = parameters.find((param) => {
    return param.in === 'body' && param.schema
  })

  if (bodySchema) {
    bodySchema = bodySchema.schema
  }

  return bodySchema
}

function getSchema(parameters: any[], type: string) {
  const params = parameters.filter(byIn(type))
  let schema: any

  if (params.length) {
    schema = { type: 'object', properties: {} }

    for (const param of params) {
      let paramSchema = copyValidationKeywords(param)

      if ('schema' in param) {
        paramSchema = {
          ...paramSchema,
          ...handleNullableSchema(param.schema)
        }
        if ('examples' in param) {
          paramSchema.examples = getExamples(param.examples)
        }
        schema.properties[param.name] = paramSchema
      } else {
        if ('examples' in paramSchema) {
          paramSchema.examples = getExamples(paramSchema.examples)
        }
        schema.properties[param.name] = param.nullable
          ? handleNullable(paramSchema)
          : paramSchema
      }
    }

    schema.required = getRequiredParams(params)
  }

  return schema
}

function getRequiredParams(parameters: any[]) {
  return parameters.filter(byRequired).map(toName)
}

function getExamples(exampleSchema: any) {
  return Object.keys(exampleSchema).map((k) => exampleSchema[k].value)
}

function byIn(str: string) {
  return (param: any) => param.in === str && param.type !== 'file'
}

function byRequired(param: any) {
  return !!param.required
}

function toName(param: any) {
  return param.name
}
