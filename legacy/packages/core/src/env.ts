export function getEnv(name: string, defaultValue: string): string
export function getEnv(name: string, defaultValue?: string): string | undefined

export function getEnv(name: string, defaultValue?: string) {
  try {
    return (
      (typeof process !== 'undefined'
        ? // eslint-disable-next-line no-process-env
          process.env?.[name]
        : undefined) ?? defaultValue
    )
  } catch (e) {
    return defaultValue
  }
}
