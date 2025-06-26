import type {
  AgenticProjectConfig,
  ResolvedAgenticProjectConfig
} from '@agentic/platform-types'
import { assert, slugify } from '@agentic/platform-core'
import { isValidProjectSlug } from '@agentic/platform-validators'
import { clean as cleanSemver, valid as isValidSemver } from 'semver'

export function resolveMetadata({
  name,
  slug,
  version
}: Pick<AgenticProjectConfig, 'name' | 'slug' | 'version'>): Pick<
  ResolvedAgenticProjectConfig,
  'slug' | 'version'
> {
  slug ??= slugify(name)

  assert(
    isValidProjectSlug(slug),
    `Invalid project slug "${slug}" for project name "${name}". Must be ascii-only, lower-case, and kebab-case with no spaces between 1 and 256 characters. For example: "my-project" or "linkedin-resolver-23"`
  )

  if (version) {
    const normalizedVersion = cleanSemver(version)!
    assert(version, `Invalid semver version "${version}" for project "${slug}"`)

    assert(
      isValidSemver(version),
      `Invalid semver version "${version}" for project "${slug}"`
    )

    // Update the config with the normalized semver version
    version = normalizedVersion
  }

  return {
    slug,
    version
  }
}
