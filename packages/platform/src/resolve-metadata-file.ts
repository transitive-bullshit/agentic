import type { UploadFileToStorageFn } from './types'

export async function resolveMetadataFile(
  input: string | undefined,
  {
    label,
    uploadFileToStorage
  }: {
    label: string
    uploadFileToStorage: UploadFileToStorageFn
  }
): Promise<string | undefined> {
  if (!input) return

  try {
    const source = new URL(input)

    return uploadFileToStorage(source.toString())
  } catch {
    throw new Error(`Invalid "${label}" must be a public URL: "${input}"`)
  }
}
