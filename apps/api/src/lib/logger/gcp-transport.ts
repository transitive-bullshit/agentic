/* eslint-disable no-process-env */

import build from 'pino-abstract-transport'

/**
 * Pino transport that send logs to GCP cloud logging.
 *
 * Google Cloud setup and auth instructions are in the root readme.
 *
 * For information about Pino transports:
 * @see https://getpino.io/#/docs/transports?id=writing-a-transport
 */
export default async function gcpTransport() {
  // Dynamically import @google-cloud/logging only if/when this function is called
  // This prevent the GCP bloatware from being loaded in prod, where this is not used.
  const { Logging } = await import('@google-cloud/logging')

  const projectId = process.env.GCP_PROJECT_ID || 'agentic-426105'
  const logName = process.env.GCP_LOG_NAME || 'local-dev'

  if (!process.env.METADATA_SERVER_DETECTION) {
    console.error(
      'Metadata server detection is not set. Set `METADATA_SERVER_DETECTION=none` in the repo root `.env`.'
    )
  }

  const logging = new Logging({ projectId })
  const log = logging.log(logName)

  return build(async function (source: AsyncIterable<Record<string, any>>) {
    for await (const obj of source) {
      try {
        const { severity, ...rest } = obj
        const entry = log.entry(
          {
            severity,
            resource: { type: 'global' }
          },
          rest
        )
        await log.write(entry)
      } catch (err) {
        console.error(
          'Error sending log to GCP. Consult `readme.md` for setup instructions.',
          err
        )
      }
    }
  })
}
