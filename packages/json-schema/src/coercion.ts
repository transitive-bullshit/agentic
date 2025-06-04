import type { InstanceType } from './types'

export function getInstanceType(
  instance: any
): Exclude<InstanceType, 'integer'> {
  const rawInstanceType = typeof instance
  switch (rawInstanceType) {
    case 'boolean':
    case 'number':
    case 'string':
      return rawInstanceType
    case 'object':
      if (instance === null) {
        return 'null'
      } else if (Array.isArray(instance)) {
        return 'array'
      } else {
        return 'object'
      }
    default:
      // undefined, bigint, function, symbol
      throw new Error(
        `Instances of "${rawInstanceType}" type are not supported.`
      )
  }
}

export function coerceValue({
  instanceType,
  instance,
  $type,
  recur = true
}: {
  instanceType: Exclude<InstanceType, 'integer'>
  instance: any
  $type: InstanceType
  recur?: boolean
}): any | undefined {
  if ($type === undefined) {
    return instance
  }

  if (Number.isNaN(instance)) {
    return undefined
  }

  let valid = true

  if ($type === 'integer') {
    if (instanceType !== 'number' || instance % 1 || Number.isNaN(instance)) {
      valid = false
    }
  } else if (instanceType !== $type) {
    valid = false
  }

  if (valid) {
    return instance
  }

  if (!recur) {
    return
  }

  switch ($type) {
    case 'integer':
    case 'number':
      switch (instanceType) {
        case 'string':
          instance = +instance
          break

        case 'boolean':
          instance = instance === true ? 1 : 0
          break

        case 'null':
          instance = 0
          break

        case 'array':
          if (instance.length === 1) {
            instance = instance[0]
          }
          break
      }
      break

    case 'string':
      switch (instanceType) {
        case 'boolean':
          instance = instance === true ? 'true' : 'false'
          break

        case 'number':
          instance = String(instance)
          break

        case 'null':
          instance = ''
          break

        case 'array':
          if (instance.length === 1) {
            instance = instance[0]
          }
          break
      }
      break

    case 'boolean':
      switch (instanceType) {
        case 'string':
          if (instance === 'true') {
            instance = true
          } else if (instance === 'false') {
            instance = false
          }
          break

        case 'number':
          if (instance === 1) {
            instance = true
          } else if (instance === 0) {
            instance = false
          }
          break

        case 'null':
          instance = false
          break

        case 'array':
          if (instance.length === 1) {
            instance = instance[0]
          }
          break
      }
      break

    case 'null':
      switch (instanceType) {
        case 'string':
          if (instance === '') {
            instance = null
          }
          break

        case 'number':
          if (instance === 0) {
            instance = null
          }
          break

        case 'boolean':
          if (instance === false) {
            instance = null
          }
          break

        case 'array':
          if (instance.length === 1 && instance[0] === null) {
            instance = null
          }
          break
      }
      break

    case 'array':
      switch (instanceType) {
        case 'string':
          instance = [instance]
          break

        case 'number':
          instance = [instance]
          break

        case 'boolean':
          instance = [instance]
          break

        case 'null':
          instance = [null]
          break
      }
      break
  }

  return coerceValue({
    instanceType: getInstanceType(instance),
    instance,
    $type,
    recur: false
  })
}
