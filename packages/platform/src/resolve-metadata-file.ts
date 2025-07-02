import type { UploadFileUrlToStorageFn } from './types'

export async function resolveMetadataFile(
  input: string | undefined,
  {
    label,
    uploadFileUrlToStorage
  }: {
    label: string
    uploadFileUrlToStorage: UploadFileUrlToStorageFn
  }
): Promise<string | undefined> {
  if (!input) return

  try {
    const source = new URL(input)

    return uploadFileUrlToStorage(source.toString())
  } catch {
    throw new Error(`Invalid "${label}" must be a public URL: "${input}"`)
  }
}
