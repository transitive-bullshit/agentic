#!/usr/bin/env node
import 'dotenv/config'

import { gracefulExit } from 'exit-hook'
import restoreCursor from 'restore-cursor'

// import { SearxngClient } from '../src/services/searxng-client.js'
// import { ClearbitClient } from '../src/index.js'
// import { ProxycurlClient } from '../src/services/proxycurl-client.js'
// import { WikipediaClient } from '../src/services/wikipedia-client.js'

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

  // const proxycurl = new ProxycurlClient()
  // const res = await proxycurl.getLinkedInPerson({
  //   linkedin_profile_url: 'https://linkedin.com/in/fisch2'
  // })
  // console.log(JSON.stringify(res, null, 2))

  // const wikipedia = new WikipediaClient()
  // const res = await wikipedia.getPageSummary({
  //   title: 'Naruto_(TV_series)'
  // })
  // console.log(JSON.stringify(res, null, 2))

  // const searxng = new SearxngClient()
  // const res = await searxng.search({
  //   query: 'golden gate bridge',
  //   engines: ['reddit']
  // })
  // console.log(JSON.stringify(res, null, 2))

  return gracefulExit(0)
}

try {
  await main()
} catch (err) {
  console.error('unexpected error', err)
  gracefulExit(1)
}
