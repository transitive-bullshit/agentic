import { ApifyClient } from 'apify-client'
import 'dotenv/config'

async function main() {
  const apify = new ApifyClient({
    token: process.env.APIFY_API_KEY
  })

  const actor = await apify.actor('apify/website-content-crawler').get()
  console.log(actor)
}

main()
