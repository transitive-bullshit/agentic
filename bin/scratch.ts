#!/usr/bin/env node
import 'dotenv/config'

import { gracefulExit } from 'exit-hook'
import restoreCursor from 'restore-cursor'

// import { ClearbitClient } from '../src/index.js'
import { ProxycurlClient } from '../src/services/proxycurl-client.js'

/**
 * Scratch pad for testing.
 */
async function main() {
  restoreCursor()

  // const clearbit = new ClearbitClient()
  // const res = await clearbit.companyEnrichment({
  //   domain: 'https://clay.com'
  // })
  // console.log(JSON.stringify(res, null, 2))

  const proxycurl = new ProxycurlClient()
  const res = await proxycurl.getLinkedInPerson({
    linkedin_profile_url: 'https://linkedin.com/in/fisch2'
    // personal_email: 'fisch0920@gmail.com'
  })
  console.log(JSON.stringify(res, null, 2))

  return gracefulExit(0)
}

try {
  await main()
} catch (err) {
  console.error('unexpected error', err)
  gracefulExit(1)
}
