import { assert } from '@agentic/platform-core'

export function validateOriginUrl({
  originUrl,
  label
}: {
  originUrl: string
  label: string
}) {
  assert(originUrl, 400, `Origin URL is required for ${label}`)

  try {
    const parsedOriginUrl = new URL(originUrl)
    assert(
      parsedOriginUrl.protocol === 'https:',
      'Invalid originUrl: must be a valid https URL'
    )

    assert(parsedOriginUrl.hostname, 'Invalid originUrl: must be a valid URL')
  } catch (err) {
    throw new Error('Invalid originUrl: must be a valid https URL', {
      cause: err
    })
  }
}
