import type {
  AgenticProjectConfig,
  ResolvedAgenticProjectConfig
} from '@agentic/platform-types'

import type { UploadFileToStorageFn } from './types'
import { resolveMetadataFile } from './resolve-metadata-file'

export async function resolveMetadataFiles(
  { readme, icon }: Pick<AgenticProjectConfig, 'readme' | 'icon'>,
  {
    uploadFileToStorage
  }: {
    uploadFileToStorage: UploadFileToStorageFn
  }
): Promise<Pick<ResolvedAgenticProjectConfig, 'readme' | 'iconUrl'>> {
  if (readme) {
    readme = await resolveMetadataFile(readme, {
      label: 'readme',
      uploadFileToStorage
    })
  }

  if (icon) {
    icon = await resolveMetadataFile(icon, {
      label: 'icon',
      uploadFileToStorage
    })
  }

  return {
    readme,
    iconUrl: icon
  }
}
