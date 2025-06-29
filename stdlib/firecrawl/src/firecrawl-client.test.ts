import { z } from 'zod'

import { FirecrawlClient } from './firecrawl-client'

// Initialize the client with the API key
const apiKey = 'FIRECRAWL-API-KEY'
const firecrawl = new FirecrawlClient({ apiKey })

// =============================================
// Test 1: URL Scraping
// =============================================
async function testUrlScraping() {
  console.log('🔍 Testing URL scraping...')
  try {
    const result = await firecrawl.scrapeUrl('https://mairistumpf.com')
    console.log('✅ URL scraping successful!')
    console.log('Result:', result)
  } catch (err) {
    console.error('❌ URL scraping failed:', err)
  }
}

// =============================================
// Test 2: Search
// =============================================
async function testSearch() {
  console.log('\n🔍 Testing search...')
  try {
    const result = await firecrawl.search({
      query: 'artificial intelligence news',
      limit: 5,
      lang: 'en',
      country: 'us'
    })
    console.log('✅ Search successful!')
    console.log('Results:', result.data)
    console.log('Results:', result.data.length)
  } catch (err) {
    console.error('❌ Search failed:', err)
  }
}

// =============================================
// Test 3: Crawl URL
// =============================================
async function testCrawlUrl() {
  console.log('\n🔍 Testing URL crawling...')
  try {
    const result = await firecrawl.crawlUrl({
      url: 'https://example.com',
      maxDepth: 2,
      limit: 5
    })
    console.log('✅ Crawl initiated successfully!')
    console.log('Result:', result)

    if (result.success && result.id) {
      // Test crawl status
      console.log('\n🔍 Testing crawl status...')
      const statusResult = await firecrawl.checkCrawlStatus(result.id)
      console.log('✅ Crawl status check successful!')
      console.log('Status:', statusResult)

      // Test crawl errors
      console.log('\n🔍 Testing crawl errors...')
      const errorsResult = await firecrawl.checkCrawlErrors(result.id)
      console.log('✅ Crawl errors check successful!')
      console.log('Errors:', errorsResult)

      // Test crawl cancellation
      console.log('\n🔍 Testing crawl cancellation...')
      const cancelResult = await firecrawl.cancelCrawl(result.id)
      console.log('✅ Crawl cancellation successful!')
      console.log('Result:', cancelResult)
    }
  } catch (err) {
    console.error('❌ Crawl operations failed:', err)
  }
}

// =============================================
// Test 4: Extract
// =============================================
async function testExtract() {
  console.log('\n🔍 Testing extract...')
  try {
    const result = await firecrawl.extract(['https://firecrawl.dev'], {
      prompt: 'Extract the pricing information from the website',
      schema: z.object({
        pricing: z.object({
          free: z.object({
            price: z.number(),
            features: z.array(z.string())
          }),
          pro: z.object({
            price: z.number(),
            features: z.array(z.string())
          })
        })
      }),
      enableWebSearch: false,
      ignoreSitemap: false,
      includeSubdomains: true,
      showSources: false,
      scrapeOptions: {
        formats: ['markdown'],
        onlyMainContent: true,
        blockAds: true,
        proxy: 'basic',
        location: {
          country: 'US',
          languages: ['en-US']
        }
      }
    })
    console.log('✅ Extract successful!')
    console.log('Result:', result)

    if (result.success && result.id) {
      // Test extract status
      console.log('\n🔍 Testing extract status...')
      const statusResult = await firecrawl.checkExtractStatus(result.id)
      console.log('✅ Extract status check successful!')
      console.log('Status:', statusResult)
    }
  } catch (err) {
    console.error('❌ Extract failed:', err)
  }
}

async function testExtractUntilCompletion() {
  console.log('\n🔍 Testing extract...')
  try {
    const result = await firecrawl.extract(['https://firecrawl.dev'], {
      prompt: 'Extract the pricing information from the website',
      schema: z.object({
        pricing: z.object({
          free: z.object({
            price: z.number(),
            features: z.array(z.string())
          }),
          pro: z.object({
            price: z.number(),
            features: z.array(z.string())
          })
        })
      }),
      enableWebSearch: false,
      ignoreSitemap: false,
      includeSubdomains: true,
      showSources: false,
      scrapeOptions: {
        formats: ['markdown'],
        onlyMainContent: true,
        blockAds: true,
        proxy: 'basic',
        location: {
          country: 'US',
          languages: ['en-US']
        }
      }
    })
    console.log('✅ Extract successful!')
    console.log('Result:', result)

    if (result.success && result.id) {
      // Test extract status
      console.log('\n🔍 Testing extract status...')
      let statusResult = await firecrawl.checkExtractStatus(result.id)

      while (statusResult.status === 'processing') {
        // wait 5 seconds and check again
        await new Promise((resolve) => setTimeout(resolve, 5000))
        statusResult = await firecrawl.checkExtractStatus(result.id)
      }
      console.log('✅ Extract status check successful!')
      console.log('Status:', statusResult)
    }
  } catch (err) {
    console.error('❌ Extract failed:', err)
  }
}

// =============================================
// Run all tests
// =============================================
console.log('🚀 Starting FirecrawlClient tests...\n')

// Run tests sequentially
await testUrlScraping()
await testSearch()
await testCrawlUrl()
await testExtract()
await testExtractUntilCompletion()

console.log('\n🏁 All tests completed!')
