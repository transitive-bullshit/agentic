import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { lookup as lookupMimeType } from 'mrmime'

export async function validateMetadataFile(
  input: string | undefined,
  {
    label,
    cwd
  }: {
    label: string
    cwd: string
  }
): Promise<string | undefined> {
  if (!input) return

  let source: string | ArrayBuffer | URL

  try {
    // Check if it's a URL.
    source = new URL(input)

    return source.toString()
  } catch {
    try {
      // Not a URL; check if it's a local file path.
      const buffer = await readFile(path.resolve(cwd, input))

      const mime =
        lookupMimeType(path.extname(input)) ?? 'application/octet-stream'

      return `data:${mime};base64,${buffer.toString('base64')}`
    } catch {
      throw new Error(
        `Invalid "${label}" (must be a URL or a path to a local file): "${input}"`
      )
    }
  }
}
