import type {
  AgenticProjectConfig,
  ResolvedAgenticProjectConfig
} from '@agentic/platform-types'

import type { UploadFileUrlToStorageFn } from './types'
import { resolveMetadataFile } from './resolve-metadata-file'

export async function resolveMetadataFiles(
  { readme, icon }: Pick<AgenticProjectConfig, 'readme' | 'icon'>,
  {
    uploadFileUrlToStorage
  }: {
    uploadFileUrlToStorage: UploadFileUrlToStorageFn
  }
): Promise<Pick<ResolvedAgenticProjectConfig, 'readme' | 'iconUrl'>> {
  if (readme) {
    readme = await resolveMetadataFile(readme, {
      label: 'readme',
      uploadFileUrlToStorage
    })
  }

  if (icon) {
    icon = await resolveMetadataFile(icon, {
      label: 'icon',
      uploadFileUrlToStorage
    })
  }

  return {
    readme,
    iconUrl: icon
  }
}
