/* eslint-disable security/detect-non-literal-regexp */
import type { OutputUnit, Schema, SchemaDraft, ValidationResult } from './types'
import { coerceValue, getInstanceType } from './coercion'
import { deepCompareStrict } from './deep-compare-strict'
import { dereference } from './dereference'
import { format } from './format'
import { encodePointer } from './pointer'
import { ucs2length } from './ucs2-length'

export type Evaluated = Record<string | number, boolean>

export function validate(
  instance: any,
  schema: Schema | boolean,
  opts: {
    draft?: SchemaDraft
    lookup?: Record<string, Schema | boolean>
    coerce?: boolean
    shortCircuit?: boolean
    recursiveAnchor?: Schema | null
    instanceLocation?: string
    schemaLocation?: string
    evaluated?: Evaluated
    strictAdditionalProperties?: boolean
  } = {}
): ValidationResult {
  const {
    draft = '2019-09',
    lookup = dereference(schema),
    coerce = false,
    shortCircuit = true,
    instanceLocation = '#',
    schemaLocation = '#',
    evaluated = Object.create(null),
    strictAdditionalProperties = false
  } = opts
  let { recursiveAnchor = null } = opts

  if (schema === true) {
    return { valid: true, errors: [], instance }
  }

  if (schema === false) {
    return {
      valid: false,
      instance,
      errors: [
        {
          instanceLocation,
          keyword: 'false',
          keywordLocation: instanceLocation,
          error: 'False boolean schema.'
        }
      ]
    }
  }

  let instanceType = getInstanceType(instance)

  const {
    $ref,
    $recursiveRef,
    $recursiveAnchor,
    type: $type,
    const: $const,
    enum: $enum,
    required: $required,
    not: $not,
    anyOf: $anyOf,
    allOf: $allOf,
    oneOf: $oneOf,
    if: $if,
    then: $then,
    else: $else,

    format: $format,

    properties: $properties,
    patternProperties: $patternProperties,
    additionalProperties: $additionalProperties,
    unevaluatedProperties: $unevaluatedProperties,
    minProperties: $minProperties,
    maxProperties: $maxProperties,
    propertyNames: $propertyNames,
    dependentRequired: $dependentRequired,
    dependentSchemas: $dependentSchemas,
    dependencies: $dependencies,

    prefixItems: $prefixItems,
    items: $items,
    additionalItems: $additionalItems,
    unevaluatedItems: $unevaluatedItems,
    contains: $contains,
    minContains: $minContains,
    maxContains: $maxContains,
    minItems: $minItems,
    maxItems: $maxItems,
    uniqueItems: $uniqueItems,

    minimum: $minimum,
    maximum: $maximum,
    exclusiveMinimum: $exclusiveMinimum,
    exclusiveMaximum: $exclusiveMaximum,
    multipleOf: $multipleOf,

    minLength: $minLength,
    maxLength: $maxLength,
    pattern: $pattern,

    // eslint-disable-next-line @typescript-eslint/naming-convention
    __absolute_ref__,

    // eslint-disable-next-line @typescript-eslint/naming-convention
    __absolute_recursive_ref__
  } = schema

  const errors: OutputUnit[] = []

  if ($recursiveAnchor === true && recursiveAnchor === null) {
    recursiveAnchor = schema
  }

  if ($recursiveRef === '#') {
    const refSchema =
      recursiveAnchor === null
        ? (lookup[__absolute_recursive_ref__!] as Schema)
        : recursiveAnchor
    const keywordLocation = `${schemaLocation}/$recursiveRef`
    const result = validate(
      instance,
      recursiveAnchor === null ? schema : recursiveAnchor,
      {
        ...opts,
        lookup,
        recursiveAnchor: refSchema,
        instanceLocation,
        schemaLocation: keywordLocation,
        evaluated
      }
    )
    if (result.valid) {
      instance = result.instance
    } else {
      errors.push(
        {
          instanceLocation,
          keyword: '$recursiveRef',
          keywordLocation,
          error: 'A subschema had errors.'
        },
        ...result.errors
      )
    }
  }

  if ($ref !== undefined) {
    const uri = __absolute_ref__ || $ref
    const refSchema = lookup[uri]
    if (refSchema === undefined) {
      let message = `Unresolved $ref "${$ref}".`
      if (__absolute_ref__ && __absolute_ref__ !== $ref) {
        message += `  Absolute URI "${__absolute_ref__}".`
      }
      message += `\nKnown schemas:\n- ${Object.keys(lookup).join('\n- ')}`
      throw new Error(message)
    }
    const keywordLocation = `${schemaLocation}/$ref`
    const result = validate(instance, refSchema, {
      ...opts,
      lookup,
      recursiveAnchor,
      instanceLocation,
      schemaLocation: keywordLocation,
      evaluated
    })
    if (result.valid) {
      instance = result.instance
    } else {
      errors.push(
        {
          instanceLocation,
          keyword: '$ref',
          keywordLocation,
          error: 'A subschema had errors.'
        },
        ...result.errors
      )
    }
    if (draft === '4' || draft === '7') {
      return { valid: errors.length === 0, instance, errors }
    }
  }

  if (Array.isArray($type)) {
    const length = $type.length
    let valid = false
    for (let i = 0; i < length; i++) {
      if (
        instanceType === $type[i] ||
        ($type[i] === 'integer' &&
          instanceType === 'number' &&
          instance % 1 === 0 &&
          Number.isNaN(instance))
      ) {
        valid = true
        break
      }
    }
    if (!valid) {
      errors.push({
        instanceLocation,
        keyword: 'type',
        keywordLocation: `${schemaLocation}/type`,
        error: `Instance type "${instanceType}" is invalid. Expected "${$type.join(
          '", "'
        )}".`
      })
    }
  } else if ($type === 'integer') {
    if (instanceType !== 'number' || instance % 1 || Number.isNaN(instance)) {
      const coercedInstance = coerce
        ? coerceValue({
            instance,
            instanceType,
            $type
          })
        : undefined

      if (coercedInstance !== undefined) {
        instance = coercedInstance
        instanceType = getInstanceType(instance)
      } else {
        errors.push({
          instanceLocation,
          keyword: 'type',
          keywordLocation: `${schemaLocation}/type`,
          error: `Instance type "${instanceType}" is invalid. Expected "${$type}".`
        })
      }
    }
  } else if ($type !== undefined && instanceType !== $type) {
    const coercedInstance = coerce
      ? coerceValue({
          instance,
          instanceType,
          $type
        })
      : undefined

    if (coercedInstance !== undefined) {
      instance = coercedInstance
      instanceType = getInstanceType(instance)
    } else {
      errors.push({
        instanceLocation,
        keyword: 'type',
        keywordLocation: `${schemaLocation}/type`,
        error: `Instance type "${instanceType}" is invalid. Expected "${$type}".`
      })
    }
  }

  if ($const !== undefined) {
    if (instanceType === 'object' || instanceType === 'array') {
      if (!deepCompareStrict(instance, $const)) {
        errors.push({
          instanceLocation,
          keyword: 'const',
          keywordLocation: `${schemaLocation}/const`,
          error: `Instance does not match ${JSON.stringify($const)}.`
        })
      }
    } else if (instance !== $const) {
      errors.push({
        instanceLocation,
        keyword: 'const',
        keywordLocation: `${schemaLocation}/const`,
        error: `Instance does not match ${JSON.stringify($const)}.`
      })
    }
  }

  if ($enum !== undefined) {
    if (instanceType === 'object' || instanceType === 'array') {
      if (!$enum.some((value) => deepCompareStrict(instance, value))) {
        errors.push({
          instanceLocation,
          keyword: 'enum',
          keywordLocation: `${schemaLocation}/enum`,
          error: `Instance does not match any of ${JSON.stringify($enum)}.`
        })
      }
    } else if (!$enum.includes(instance)) {
      errors.push({
        instanceLocation,
        keyword: 'enum',
        keywordLocation: `${schemaLocation}/enum`,
        error: `Instance does not match any of ${JSON.stringify($enum)}.`
      })
    }
  }

  // TODO: type coercion
  if ($not !== undefined) {
    const keywordLocation = `${schemaLocation}/not`
    const result = validate(instance, $not, {
      ...opts,
      lookup,
      recursiveAnchor,
      instanceLocation,
      schemaLocation: keywordLocation
      // evaluated
    })
    if (result.valid) {
      errors.push({
        instanceLocation,
        keyword: 'not',
        keywordLocation,
        error: 'Instance matched "not" schema.'
      })
    }
  }

  const subEvaluateds: Array<Evaluated> = []

  // TODO: type coercion
  if ($anyOf !== undefined) {
    const keywordLocation = `${schemaLocation}/anyOf`
    const errorsLength = errors.length
    let anyValid = false
    for (const [i, subSchema] of $anyOf.entries()) {
      const subEvaluated: Evaluated = Object.create(evaluated)
      const result = validate(instance, subSchema, {
        ...opts,
        lookup,
        recursiveAnchor: $recursiveAnchor === true ? recursiveAnchor : null,
        instanceLocation,
        schemaLocation: `${keywordLocation}/${i}`,
        evaluated: subEvaluated
      })
      errors.push(...result.errors)
      anyValid = anyValid || result.valid
      if (result.valid) {
        subEvaluateds.push(subEvaluated)
      }
    }
    if (anyValid) {
      errors.length = errorsLength
    } else {
      errors.splice(errorsLength, 0, {
        instanceLocation,
        keyword: 'anyOf',
        keywordLocation,
        error: 'Instance does not match any subschemas.'
      })
    }
  }

  // TODO: type coercion
  if ($allOf !== undefined) {
    const keywordLocation = `${schemaLocation}/allOf`
    const errorsLength = errors.length
    let allValid = true
    for (const [i, subSchema] of $allOf.entries()) {
      const subEvaluated: Evaluated = Object.create(evaluated)
      const result = validate(instance, subSchema, {
        ...opts,
        lookup,
        recursiveAnchor: $recursiveAnchor === true ? recursiveAnchor : null,
        instanceLocation,
        schemaLocation: `${keywordLocation}/${i}`,
        evaluated: subEvaluated
      })
      errors.push(...result.errors)
      allValid = allValid && result.valid
      if (result.valid) {
        subEvaluateds.push(subEvaluated)
      }
    }
    if (allValid) {
      errors.length = errorsLength
    } else {
      errors.splice(errorsLength, 0, {
        instanceLocation,
        keyword: 'allOf',
        keywordLocation,
        error: `Instance does not match every subschema.`
      })
    }
  }

  // TODO: type coercion
  if ($oneOf !== undefined) {
    const keywordLocation = `${schemaLocation}/oneOf`
    const errorsLength = errors.length
    const matches = $oneOf.filter((subSchema, i) => {
      const subEvaluated: Evaluated = Object.create(evaluated)
      const result = validate(instance, subSchema, {
        ...opts,
        lookup,
        recursiveAnchor: $recursiveAnchor === true ? recursiveAnchor : null,
        instanceLocation,
        schemaLocation: `${keywordLocation}/${i}`,
        evaluated: subEvaluated
      })
      errors.push(...result.errors)
      if (result.valid) {
        subEvaluateds.push(subEvaluated)
      }
      return result.valid
    }).length
    if (matches === 1) {
      errors.length = errorsLength
    } else {
      errors.splice(errorsLength, 0, {
        instanceLocation,
        keyword: 'oneOf',
        keywordLocation,
        error: `Instance does not match exactly one subschema (${matches} matches).`
      })
    }
  }

  if (instanceType === 'object' || instanceType === 'array') {
    Object.assign(evaluated, ...subEvaluateds)
  }

  if ($if !== undefined) {
    const keywordLocation = `${schemaLocation}/if`
    const conditionResult = validate(instance, $if, {
      ...opts,
      lookup,
      recursiveAnchor,
      instanceLocation,
      schemaLocation: keywordLocation,
      evaluated
    }).valid
    if (conditionResult) {
      if ($then !== undefined) {
        const thenResult = validate(instance, $then, {
          ...opts,
          lookup,
          recursiveAnchor,
          instanceLocation,
          schemaLocation: `${schemaLocation}/then`,
          evaluated
        })
        if (thenResult.valid) {
          instance = thenResult.instance
        } else {
          errors.push(
            {
              instanceLocation,
              keyword: 'if',
              keywordLocation,
              error: `Instance does not match "then" schema.`
            },
            ...thenResult.errors
          )
        }
      }
    } else if ($else !== undefined) {
      const elseResult = validate(instance, $else, {
        ...opts,
        lookup,
        recursiveAnchor,
        instanceLocation,
        schemaLocation: `${schemaLocation}/else`,
        evaluated
      })
      if (elseResult.valid) {
        instance = elseResult.instance
      } else {
        errors.push(
          {
            instanceLocation,
            keyword: 'if',
            keywordLocation,
            error: `Instance does not match "else" schema.`
          },
          ...elseResult.errors
        )
      }
    }
  }

  if (instanceType === 'object') {
    if ($required !== undefined) {
      for (const key of $required) {
        if (!(key in instance)) {
          errors.push({
            instanceLocation,
            keyword: 'required',
            keywordLocation: `${schemaLocation}/required`,
            error: `Instance does not have required property "${key}".`
          })
        }
      }
    }

    const keys = Object.keys(instance)

    if ($minProperties !== undefined && keys.length < $minProperties) {
      errors.push({
        instanceLocation,
        keyword: 'minProperties',
        keywordLocation: `${schemaLocation}/minProperties`,
        error: `Instance does not have at least ${$minProperties} properties.`
      })
    }

    if ($maxProperties !== undefined && keys.length > $maxProperties) {
      errors.push({
        instanceLocation,
        keyword: 'maxProperties',
        keywordLocation: `${schemaLocation}/maxProperties`,
        error: `Instance does not have at least ${$maxProperties} properties.`
      })
    }

    if ($propertyNames !== undefined) {
      const keywordLocation = `${schemaLocation}/propertyNames`
      for (const key in instance) {
        const subInstancePointer = `${instanceLocation}/${encodePointer(key)}`
        const result = validate(key, $propertyNames, {
          ...opts,
          lookup,
          recursiveAnchor,
          instanceLocation: subInstancePointer,
          schemaLocation: keywordLocation
        })
        if (!result.valid) {
          errors.push(
            {
              instanceLocation,
              keyword: 'propertyNames',
              keywordLocation,
              error: `Property name "${key}" does not match schema.`
            },
            ...result.errors
          )
        }
      }
    }

    if ($dependentRequired !== undefined) {
      const keywordLocation = `${schemaLocation}/dependantRequired`
      for (const key in $dependentRequired) {
        if (key in instance) {
          const required = $dependentRequired[key] as string[]
          for (const dependantKey of required) {
            if (!(dependantKey in instance)) {
              errors.push({
                instanceLocation,
                keyword: 'dependentRequired',
                keywordLocation,
                error: `Instance has "${key}" but does not have "${dependantKey}".`
              })
            }
          }
        }
      }
    }

    if ($dependentSchemas !== undefined) {
      for (const key in $dependentSchemas) {
        const keywordLocation = `${schemaLocation}/dependentSchemas`
        if (key in instance) {
          const result = validate(instance, $dependentSchemas[key]!, {
            ...opts,
            lookup,
            recursiveAnchor,
            instanceLocation,
            schemaLocation: `${keywordLocation}/${encodePointer(key)}`,
            evaluated
          })
          if (!result.valid) {
            errors.push(
              {
                instanceLocation,
                keyword: 'dependentSchemas',
                keywordLocation,
                error: `Instance has "${key}" but does not match dependant schema.`
              },
              ...result.errors
            )
          }
        }
      }
    }

    if ($dependencies !== undefined) {
      const keywordLocation = `${schemaLocation}/dependencies`
      for (const key in $dependencies) {
        if (key in instance) {
          const propsOrSchema = $dependencies[key] as Schema | string[]
          if (Array.isArray(propsOrSchema)) {
            for (const dependantKey of propsOrSchema) {
              if (!(dependantKey in instance)) {
                errors.push({
                  instanceLocation,
                  keyword: 'dependencies',
                  keywordLocation,
                  error: `Instance has "${key}" but does not have "${dependantKey}".`
                })
              }
            }
          } else {
            const result = validate(instance, propsOrSchema, {
              ...opts,
              lookup,
              recursiveAnchor,
              instanceLocation,
              schemaLocation: `${keywordLocation}/${encodePointer(key)}`
            })
            if (!result.valid) {
              errors.push(
                {
                  instanceLocation,
                  keyword: 'dependencies',
                  keywordLocation,
                  error: `Instance has "${key}" but does not match dependant schema.`
                },
                ...result.errors
              )
            }
          }
        }
      }
    }

    const thisEvaluated = Object.create(null)

    let stop = false

    if ($properties !== undefined) {
      const keywordLocation = `${schemaLocation}/properties`
      for (const key in $properties) {
        if (!(key in instance)) {
          continue
        }
        const subInstancePointer = `${instanceLocation}/${encodePointer(key)}`
        const result = validate(instance[key], $properties[key]!, {
          ...opts,
          lookup,
          recursiveAnchor,
          instanceLocation: subInstancePointer,
          schemaLocation: `${keywordLocation}/${encodePointer(key)}`
        })
        if (result.valid) {
          evaluated[key] = thisEvaluated[key] = true
          instance[key] = result.instance
        } else {
          stop = shortCircuit
          errors.push(
            {
              instanceLocation,
              keyword: 'properties',
              keywordLocation,
              error: `Property "${key}" does not match schema.`
            },
            ...result.errors
          )
          if (stop) break
        }
      }
    }

    if (!stop && $patternProperties !== undefined) {
      const keywordLocation = `${schemaLocation}/patternProperties`
      for (const pattern in $patternProperties) {
        const regex = new RegExp(pattern, 'u')
        const subSchema = $patternProperties[pattern]
        for (const key in instance) {
          if (!regex.test(key)) {
            continue
          }
          const subInstancePointer = `${instanceLocation}/${encodePointer(key)}`
          const result = validate(instance[key], subSchema!, {
            ...opts,
            lookup,
            recursiveAnchor,
            instanceLocation: subInstancePointer,
            schemaLocation: `${keywordLocation}/${encodePointer(pattern)}`
          })
          if (result.valid) {
            evaluated[key] = thisEvaluated[key] = true
            instance[key] = result.instance
          } else {
            stop = shortCircuit
            errors.push(
              {
                instanceLocation,
                keyword: 'patternProperties',
                keywordLocation,
                error: `Property "${key}" matches pattern "${pattern}" but does not match associated schema.`
              },
              ...result.errors
            )
          }
        }
      }
    }

    if (
      !stop &&
      ($additionalProperties !== undefined || strictAdditionalProperties)
    ) {
      const keywordLocation = `${schemaLocation}/additionalProperties`
      for (const key in instance) {
        if (thisEvaluated[key]) {
          continue
        }
        const subInstancePointer = `${instanceLocation}/${encodePointer(key)}`
        const result = validate(
          instance[key],
          $additionalProperties ?? !strictAdditionalProperties,
          {
            ...opts,
            lookup,
            recursiveAnchor,
            instanceLocation: subInstancePointer,
            schemaLocation: keywordLocation
          }
        )
        if (result.valid) {
          evaluated[key] = true
          instance[key] = result.instance
        } else {
          stop = shortCircuit
          errors.push(
            {
              instanceLocation,
              keyword: 'additionalProperties',
              keywordLocation,
              error: `Property "${key}" does not match additional properties schema.`
            },
            ...result.errors
          )
        }
      }
    } else if (!stop && $unevaluatedProperties !== undefined) {
      const keywordLocation = `${schemaLocation}/unevaluatedProperties`
      for (const key in instance) {
        if (!evaluated[key]) {
          const subInstancePointer = `${instanceLocation}/${encodePointer(key)}`
          const result = validate(instance[key], $unevaluatedProperties, {
            ...opts,
            lookup,
            recursiveAnchor,
            instanceLocation: subInstancePointer,
            schemaLocation: keywordLocation
          })
          if (result.valid) {
            evaluated[key] = true
            instance[key] = result.instance
          } else {
            errors.push(
              {
                instanceLocation,
                keyword: 'unevaluatedProperties',
                keywordLocation,
                error: `Property "${key}" does not match unevaluated properties schema.`
              },
              ...result.errors
            )
          }
        }
      }
    }
  } else if (instanceType === 'array') {
    if ($maxItems !== undefined && instance.length > $maxItems) {
      errors.push({
        instanceLocation,
        keyword: 'maxItems',
        keywordLocation: `${schemaLocation}/maxItems`,
        error: `Array has too many items (${instance.length} > ${$maxItems}).`
      })
    }

    if ($minItems !== undefined && instance.length < $minItems) {
      errors.push({
        instanceLocation,
        keyword: 'minItems',
        keywordLocation: `${schemaLocation}/minItems`,
        error: `Array has too few items (${instance.length} < ${$minItems}).`
      })
    }

    const length: number = instance.length
    let i = 0
    let stop = false

    if ($prefixItems !== undefined) {
      const keywordLocation = `${schemaLocation}/prefixItems`
      const length2 = Math.min($prefixItems.length, length)
      for (; i < length2; i++) {
        const result = validate(instance[i], $prefixItems[i]!, {
          ...opts,
          lookup,
          recursiveAnchor,
          instanceLocation: `${instanceLocation}/${i}`,
          schemaLocation: `${keywordLocation}/${i}`
        })
        evaluated[i] = true
        if (!result.valid) {
          stop = shortCircuit
          errors.push(
            {
              instanceLocation,
              keyword: 'prefixItems',
              keywordLocation,
              error: `Items did not match schema.`
            },
            ...result.errors
          )
          if (stop) break
        }
      }
    }

    if ($items !== undefined) {
      const keywordLocation = `${schemaLocation}/items`
      if (Array.isArray($items)) {
        const length2 = Math.min($items.length, length)
        for (; i < length2; i++) {
          const result = validate(instance[i], $items[i]!, {
            ...opts,
            lookup,
            recursiveAnchor,
            instanceLocation: `${instanceLocation}/${i}`,
            schemaLocation: `${keywordLocation}/${i}`
          })
          evaluated[i] = true
          if (result.valid) {
            instance[i] = result.instance
          } else {
            stop = shortCircuit
            errors.push(
              {
                instanceLocation,
                keyword: 'items',
                keywordLocation,
                error: `Items did not match schema.`
              },
              ...result.errors
            )
            if (stop) break
          }
        }
      } else {
        for (; i < length; i++) {
          const result = validate(instance[i], $items, {
            ...opts,
            lookup,
            recursiveAnchor,
            instanceLocation: `${instanceLocation}/${i}`,
            schemaLocation: keywordLocation
          })
          evaluated[i] = true
          if (result.valid) {
            instance[i] = result.instance
          } else {
            stop = shortCircuit
            errors.push(
              {
                instanceLocation,
                keyword: 'items',
                keywordLocation,
                error: `Items did not match schema.`
              },
              ...result.errors
            )
            if (stop) break
          }
        }
      }

      if (!stop && $additionalItems !== undefined) {
        const keywordLocation = `${schemaLocation}/additionalItems`
        for (; i < length; i++) {
          const result = validate(instance[i], $additionalItems, {
            ...opts,
            lookup,
            recursiveAnchor,
            instanceLocation: `${instanceLocation}/${i}`,
            schemaLocation: keywordLocation
          })
          evaluated[i] = true
          if (result.valid) {
            instance[i] = result.instance
          } else if (!result.valid) {
            stop = shortCircuit
            errors.push(
              {
                instanceLocation,
                keyword: 'additionalItems',
                keywordLocation,
                error: `Items did not match additional items schema.`
              },
              ...result.errors
            )
          }
        }
      }
    }

    if ($contains !== undefined) {
      if (length === 0 && $minContains === undefined) {
        errors.push({
          instanceLocation,
          keyword: 'contains',
          keywordLocation: `${schemaLocation}/contains`,
          error: `Array is empty. It must contain at least one item matching the schema.`
        })
      } else if ($minContains !== undefined && length < $minContains) {
        errors.push({
          instanceLocation,
          keyword: 'minContains',
          keywordLocation: `${schemaLocation}/minContains`,
          error: `Array has less items (${length}) than minContains (${$minContains}).`
        })
      } else {
        const keywordLocation = `${schemaLocation}/contains`
        const errorsLength = errors.length
        let contained = 0
        for (let j = 0; j < length; j++) {
          const result = validate(instance[j], $contains, {
            ...opts,
            lookup,
            recursiveAnchor,
            instanceLocation: `${instanceLocation}/${j}`,
            schemaLocation: keywordLocation
          })
          if (result.valid) {
            evaluated[j] = true
            contained++
          } else {
            errors.push(...result.errors)
          }
        }

        if (contained >= ($minContains || 0)) {
          errors.length = errorsLength
        }

        if (
          $minContains === undefined &&
          $maxContains === undefined &&
          contained === 0
        ) {
          errors.splice(errorsLength, 0, {
            instanceLocation,
            keyword: 'contains',
            keywordLocation,
            error: `Array does not contain item matching schema.`
          })
        } else if ($minContains !== undefined && contained < $minContains) {
          errors.push({
            instanceLocation,
            keyword: 'minContains',
            keywordLocation: `${schemaLocation}/minContains`,
            error: `Array must contain at least ${$minContains} items matching schema. Only ${contained} items were found.`
          })
        } else if ($maxContains !== undefined && contained > $maxContains) {
          errors.push({
            instanceLocation,
            keyword: 'maxContains',
            keywordLocation: `${schemaLocation}/maxContains`,
            error: `Array may contain at most ${$maxContains} items matching schema. ${contained} items were found.`
          })
        }
      }
    }

    if (!stop && $unevaluatedItems !== undefined) {
      const keywordLocation = `${schemaLocation}/unevaluatedItems`
      for (i; i < length; i++) {
        if (evaluated[i]) {
          continue
        }
        const result = validate(instance[i], $unevaluatedItems, {
          ...opts,
          lookup,
          recursiveAnchor,
          instanceLocation: `${instanceLocation}/${i}`,
          schemaLocation: keywordLocation
        })
        evaluated[i] = true
        if (result.valid) {
          instance[i] = result.instance
        } else {
          errors.push(
            {
              instanceLocation,
              keyword: 'unevaluatedItems',
              keywordLocation,
              error: `Items did not match unevaluated items schema.`
            },
            ...result.errors
          )
        }
      }
    }

    if ($uniqueItems) {
      for (let j = 0; j < length; j++) {
        const a = instance[j]
        const ao = typeof a === 'object' && a !== null
        for (let k = 0; k < length; k++) {
          if (j === k) {
            continue
          }
          const b = instance[k]
          const bo = typeof b === 'object' && b !== null
          if (a === b || (ao && bo && deepCompareStrict(a, b))) {
            errors.push({
              instanceLocation,
              keyword: 'uniqueItems',
              keywordLocation: `${schemaLocation}/uniqueItems`,
              error: `Duplicate items at indexes ${j} and ${k}.`
            })
            j = Number.MAX_SAFE_INTEGER
            k = Number.MAX_SAFE_INTEGER
          }
        }
      }
    }
  } else if (instanceType === 'number') {
    if (draft === '4') {
      if (
        $minimum !== undefined &&
        (($exclusiveMinimum === true && instance <= $minimum) ||
          instance < $minimum)
      ) {
        errors.push({
          instanceLocation,
          keyword: 'minimum',
          keywordLocation: `${schemaLocation}/minimum`,
          error: `${instance} is less than ${
            $exclusiveMinimum ? 'or equal to ' : ''
          } ${$minimum}.`
        })
      }
      if (
        $maximum !== undefined &&
        (($exclusiveMaximum === true && instance >= $maximum) ||
          instance > $maximum)
      ) {
        errors.push({
          instanceLocation,
          keyword: 'maximum',
          keywordLocation: `${schemaLocation}/maximum`,
          error: `${instance} is greater than ${
            $exclusiveMaximum ? 'or equal to ' : ''
          } ${$maximum}.`
        })
      }
    } else {
      if ($minimum !== undefined && instance < $minimum) {
        errors.push({
          instanceLocation,
          keyword: 'minimum',
          keywordLocation: `${schemaLocation}/minimum`,
          error: `${instance} is less than ${$minimum}.`
        })
      }
      if ($maximum !== undefined && instance > $maximum) {
        errors.push({
          instanceLocation,
          keyword: 'maximum',
          keywordLocation: `${schemaLocation}/maximum`,
          error: `${instance} is greater than ${$maximum}.`
        })
      }
      if ($exclusiveMinimum !== undefined && instance <= $exclusiveMinimum) {
        errors.push({
          instanceLocation,
          keyword: 'exclusiveMinimum',
          keywordLocation: `${schemaLocation}/exclusiveMinimum`,
          error: `${instance} is less than ${$exclusiveMinimum}.`
        })
      }
      if ($exclusiveMaximum !== undefined && instance >= $exclusiveMaximum) {
        errors.push({
          instanceLocation,
          keyword: 'exclusiveMaximum',
          keywordLocation: `${schemaLocation}/exclusiveMaximum`,
          error: `${instance} is greater than or equal to ${$exclusiveMaximum}.`
        })
      }
    }
    if ($multipleOf !== undefined) {
      const remainder = instance % $multipleOf
      if (
        Math.abs(0 - remainder) >= 1.192_092_9e-7 &&
        Math.abs($multipleOf - remainder) >= 1.192_092_9e-7
      ) {
        errors.push({
          instanceLocation,
          keyword: 'multipleOf',
          keywordLocation: `${schemaLocation}/multipleOf`,
          error: `${instance} is not a multiple of ${$multipleOf}.`
        })
      }
    }
  } else if (instanceType === 'string') {
    const length =
      $minLength === undefined && $maxLength === undefined
        ? 0
        : ucs2length(instance)
    if ($minLength !== undefined && length < $minLength) {
      errors.push({
        instanceLocation,
        keyword: 'minLength',
        keywordLocation: `${schemaLocation}/minLength`,
        error: `String is too short (${length} < ${$minLength}).`
      })
    }
    if ($maxLength !== undefined && length > $maxLength) {
      errors.push({
        instanceLocation,
        keyword: 'maxLength',
        keywordLocation: `${schemaLocation}/maxLength`,
        error: `String is too long (${length} > ${$maxLength}).`
      })
    }
    if ($pattern !== undefined && !new RegExp($pattern, 'u').test(instance)) {
      errors.push({
        instanceLocation,
        keyword: 'pattern',
        keywordLocation: `${schemaLocation}/pattern`,
        error: `String does not match pattern.`
      })
    }
    if (
      $format !== undefined &&
      format[$format] &&
      !format[$format](instance)
    ) {
      errors.push({
        instanceLocation,
        keyword: 'format',
        keywordLocation: `${schemaLocation}/format`,
        error: `String does not match format "${$format}".`
      })
    }
  }

  return { valid: errors.length === 0, instance, errors }
}
