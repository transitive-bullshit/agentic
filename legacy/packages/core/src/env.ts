/**
 * Retrieves the value of an environment variable with the given name.
 *
 * @param name - name of the environment variable to retrieve
 * @param defaultValue - default value to return if the environment variable is not defined
 * @returns value of the environment variable, or the default value if the variable is not defined
 */
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

/**
 * Retrieves the values of multiple environment variables with the given names.
 *
 * @param names - names of the environment variables to retrieve
 * @param defaultValues - default values to return if the environment variables are not defined
 * @returns an object containing the values of the environment variables, or the default values if the variables are not defined
 */
export function getEnvs(
  names: string[],
  defaultValues: { [key: string]: string | undefined } = {}
): { [key: string]: string | undefined } {
  const envs: { [key: string]: string | undefined } = {}

  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    envs[name] = getEnv(name, defaultValues[name])
  }

  return envs
}
