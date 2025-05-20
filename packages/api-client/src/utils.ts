export function getEnv(name: string): string | undefined {
  try {
    return typeof process !== 'undefined'
      ? // eslint-disable-next-line no-process-env
        process.env?.[name]
      : undefined
  } catch {
    return undefined
  }
}

/**
 * Creates a new `URLSearchParams` object with all values coerced to strings
 * that correctly handles arrays of values as repeated keys (or CSV) and
 * correctly removes `undefined` keys and values.
 */
export function sanitizeSearchParams(
  searchParams:
    | Record<
        string,
        string | number | boolean | string[] | number[] | boolean[] | undefined
      >
    | object,
  {
    csv = false
  }: {
    /**
     * Whether to use comma-separated-values for arrays or multiple entries.
     *
     * Defaults to `false` and will use multiple entries.
     */
    csv?: boolean
  } = {}
): URLSearchParams {
  const entries = Object.entries(searchParams).flatMap(([key, value]) => {
    if (key === undefined || value === undefined) {
      return []
    }

    if (Array.isArray(value)) {
      return value.map((v) => [key, String(v)])
    }

    return [[key, String(value)]]
  }) as [string, string][]

  if (!csv) {
    return new URLSearchParams(entries)
  }

  const csvEntries: Record<string, string> = {}
  for (const [key, value] of entries) {
    csvEntries[key] = csvEntries[key] ? `${csvEntries[key]},${value}` : value
  }

  return new URLSearchParams(csvEntries)
}
