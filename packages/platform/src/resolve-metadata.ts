import type { AgenticProjectConfig } from '@agentic/platform-schemas'
import { assert } from '@agentic/platform-core'
import { validators } from '@agentic/platform-validators'
import { clean as cleanSemver, valid as isValidSemver } from 'semver'

export function resolveMetadata({
  name,
  version
}: Pick<AgenticProjectConfig, 'name' | 'version'>): Pick<
  AgenticProjectConfig,
  'name' | 'version'
> {
  assert(
    validators.projectName(name),
    `Invalid project name "${name}". Must be lower kebab-case with no spaces between 2 and 64 characters. Example: "my-project" or "linkedin-resolver-23"`
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
