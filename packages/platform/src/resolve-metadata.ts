import type { AgenticProjectConfig } from '@agentic/platform-types'
import { assert } from '@agentic/platform-core'
import { isValidProjectName } from '@agentic/platform-validators'
import { clean as cleanSemver, valid as isValidSemver } from 'semver'

export function resolveMetadata({
  name,
  version
}: Pick<AgenticProjectConfig, 'name' | 'version'>): Pick<
  AgenticProjectConfig,
  'name' | 'version'
> {
  assert(
    isValidProjectName(name),
    `Invalid project name "${name}". Must be ascii-only lower kebab-case with no spaces between 1 and 256 characters. For example: "my-project" or "linkedin-resolver-23"`
  )

  if (version) {
    const normalizedVersion = cleanSemver(version)!
    assert(version, `Invalid semver version "${version}" for project "${name}"`)

    assert(
      isValidSemver(version),
      `Invalid semver version "${version}" for project "${name}"`
    )

    // Update the config with the normalized semver version
    version = normalizedVersion
  }

  return {
    name,
    version
  }
}
