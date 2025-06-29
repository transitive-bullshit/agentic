export function hasProp<T>(
  target: T | undefined,
  key: keyof T
): key is keyof T {
  return Boolean(target) && Object.prototype.hasOwnProperty.call(target, key)
}

export function getProp(
  target: unknown,
  paths: readonly (keyof any)[],
  defaultValue: any = undefined
) {
  let value: any = target
  if (!value) {
    return undefined
  }

  for (const key of paths) {
    if (!hasProp(value, key)) {
      return defaultValue
    }
    value = value[key]
  }
  return value
}

export function castArray<T>(arr: T) {
  const result = Array.isArray(arr) ? arr : [arr]
  return result as T extends unknown[] ? T : [T]
}
