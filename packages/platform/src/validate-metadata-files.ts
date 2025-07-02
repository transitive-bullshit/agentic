import type { AgenticProjectConfig } from '@agentic/platform-types'

import { validateMetadataFile } from './validate-metadata-file'

export async function validateMetadataFiles(
  { readme, icon }: Pick<AgenticProjectConfig, 'readme' | 'icon'>,
  {
    cwd = process.cwd()
  }: {
    cwd?: string
  }
): Promise<Pick<AgenticProjectConfig, 'readme' | 'icon'>> {
  if (readme) {
    readme = await validateMetadataFile(readme, { label: 'readme', cwd })
  }

  if (icon) {
    icon = await validateMetadataFile(icon, { label: 'icon', cwd })
  }

  return {
    readme,
    icon
  }
}
