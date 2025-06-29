/**
 * This file was auto-generated from an OpenAPI spec.
 */

import { z } from 'zod'

export namespace firecrawl {
  export const apiBaseUrl = 'https://api.firecrawl.dev/v0'

  // -----------------------------------------------------------------------------
  // Component schemas
  // -----------------------------------------------------------------------------

  export const ScrapeResponseSchema = z.object({
    success: z.boolean().optional(),
    /** Warning message to let you know of any issues. */
    warning: z
      .string()
      .describe('Warning message to let you know of any issues.')
      .optional(),
    data: z
      .object({
        /** Markdown content of the page if the `markdown` format was specified (default) */
        markdown: z
          .string()
          .describe(
            'Markdown content of the page if the `markdown` format was specified (default)'
          )
          .optional(),
        /** HTML version of the content on page if the `html` format was specified */
        html: z
          .string()
          .describe(
            'HTML version of the content on page if the `html` format was specified'
          )
          .optional(),
        /** Raw HTML content of the page if the `rawHtml` format was specified */
        rawHtml: z
          .string()
          .describe(
            'Raw HTML content of the page if the `rawHtml` format was specified'
          )
          .optional(),
        /** Links on the page if the `links` format was specified */
        links: z
          .array(z.string().url())
          .describe('Links on the page if the `links` format was specified')
          .optional(),
        /** URL of the screenshot of the page if the `screenshot` or `screenshot@fullSize` format was specified */
        screenshot: z
          .string()
          .describe(
            'URL of the screenshot of the page if the `screenshot` or `screenshot@fullSize` format was specified'
          )
          .optional(),
        metadata: z
          .object({
            title: z.string().optional(),
            description: z.string().optional(),
            language: z.string().optional(),
            sourceURL: z.string().url().optional(),
            '<any other metadata> ': z.string().optional(),
            /** The status code of the page */
            statusCode: z
              .number()
              .int()
              .describe('The status code of the page')
              .optional(),
            /** The error message of the page */
            error: z
              .string()
              .describe('The error message of the page')
              .optional()
          })
          .optional()
      })
      .optional()
  })
  export type ScrapeResponse = z.infer<typeof ScrapeResponseSchema>

  export const CrawlResponseSchema = z.object({
    success: z.boolean().optional(),
    id: z.string().optional(),
    url: z.string().url().optional()
  })
  export type CrawlResponse = z.infer<typeof CrawlResponseSchema>

  export const SearchResponseSchema = z.object({
    success: z.boolean().optional(),
    data: z.array(z.any()).optional()
  })
  export type SearchResponse = z.infer<typeof SearchResponseSchema>

  export const CrawlStatusResponseObjSchema = z.object({
    /** Markdown content of the page if the `markdown` format was specified (default) */
    markdown: z
      .string()
      .describe(
        'Markdown content of the page if the `markdown` format was specified (default)'
      )
      .optional(),
    /** HTML version of the content on page if the `html` format was specified */
    html: z
      .string()
      .describe(
        'HTML version of the content on page if the `html` format was specified'
      )
      .optional(),
    /** Raw HTML content of the page if the `rawHtml` format was specified */
    rawHtml: z
      .string()
      .describe(
        'Raw HTML content of the page if the `rawHtml` format was specified'
      )
      .optional(),
    /** Links on the page if the `links` format was specified */
    links: z
      .array(z.string().url())
      .describe('Links on the page if the `links` format was specified')
      .optional(),
    /** URL of the screenshot of the page if the `screenshot` or `screenshot@fullSize` format was specified */
    screenshot: z
      .string()
      .describe(
        'URL of the screenshot of the page if the `screenshot` or `screenshot@fullSize` format was specified'
      )
      .optional(),
    metadata: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        language: z.string().optional(),
        sourceURL: z.string().url().optional(),
        '<any other metadata> ': z.string().optional(),
        /** The status code of the page */
        statusCode: z
          .number()
          .int()
          .describe('The status code of the page')
          .optional(),
        /** The error message of the page */
        error: z.string().describe('The error message of the page').optional()
      })
      .optional()
  })
  export type CrawlStatusResponseObj = z.infer<
    typeof CrawlStatusResponseObjSchema
  >

  // -----------------------------------------------------------------------------
  // Operation schemas
  // -----------------------------------------------------------------------------

  export const ScrapeParamsSchema = z.object({
    /** The URL to scrape */
    url: z.string().url().describe('The URL to scrape'),
    /**
     * Specific formats to return.
     *
     *  - markdown: The page in Markdown format.
     *  - html: The page's HTML, trimmed to include only meaningful content.
     *  - rawHtml: The page's original HTML.
     *  - links: The links on the page.
     *  - screenshot: A screenshot of the top of the page.
     *  - screenshot@fullPage: A screenshot of the full page. (overridden by screenshot if present)
     */
    formats: z
      .array(
        z.enum([
          'markdown',
          'html',
          'rawHtml',
          'links',
          'screenshot',
          'screenshot@fullPage'
        ])
      )
      .describe(
        "Specific formats to return.\n\n - markdown: The page in Markdown format.\n - html: The page's HTML, trimmed to include only meaningful content.\n - rawHtml: The page's original HTML.\n - links: The links on the page.\n - screenshot: A screenshot of the top of the page.\n - screenshot@fullPage: A screenshot of the full page. (overridden by screenshot if present)"
      )
      .default(['markdown']),
    /** Headers to send with the request. Can be used to send cookies, user-agent, etc. */
    headers: z
      .record(z.any())
      .describe(
        'Headers to send with the request. Can be used to send cookies, user-agent, etc.'
      )
      .optional(),
    /** Only include tags, classes and ids from the page in the final output. Use comma separated values. Example: 'script, .ad, #footer' */
    includeTags: z
      .array(z.string())
      .describe(
        "Only include tags, classes and ids from the page in the final output. Use comma separated values. Example: 'script, .ad, #footer'"
      )
      .optional(),
    /** Tags, classes and ids to remove from the page. Use comma separated values. Example: 'script, .ad, #footer' */
    excludeTags: z
      .array(z.string())
      .describe(
        "Tags, classes and ids to remove from the page. Use comma separated values. Example: 'script, .ad, #footer'"
      )
      .optional(),
    /** Only return the main content of the page excluding headers, navs, footers, etc. */
    onlyMainContent: z
      .boolean()
      .describe(
        'Only return the main content of the page excluding headers, navs, footers, etc.'
      )
      .default(true),
    /** Timeout in milliseconds for the request */
    timeout: z
      .number()
      .int()
      .describe('Timeout in milliseconds for the request')
      .default(30_000),
    /** Wait x amount of milliseconds for the page to load to fetch content */
    waitFor: z
      .number()
      .int()
      .describe(
        'Wait x amount of milliseconds for the page to load to fetch content'
      )
      .default(0)
  })
  export type ScrapeParams = z.infer<typeof ScrapeParamsSchema>

  export const CrawlUrlsParamsSchema = z.object({
    /** The base URL to start crawling from */
    url: z.string().url().describe('The base URL to start crawling from'),
    crawlerOptions: z
      .object({
        /** URL patterns to include */
        includes: z
          .array(z.string())
          .describe('URL patterns to include')
          .optional(),
        /** URL patterns to exclude */
        excludes: z
          .array(z.string())
          .describe('URL patterns to exclude')
          .optional(),
        /** Generate alt text for images using LLMs (must have a paid plan) */
        generateImgAltText: z
          .boolean()
          .describe(
            'Generate alt text for images using LLMs (must have a paid plan)'
          )
          .default(false),
        /** If true, returns only the URLs as a list on the crawl status. Attention: the return response will be a list of URLs inside the data, not a list of documents. */
        returnOnlyUrls: z
          .boolean()
          .describe(
            'If true, returns only the URLs as a list on the crawl status. Attention: the return response will be a list of URLs inside the data, not a list of documents.'
          )
          .default(false),
        /** Maximum depth to crawl relative to the entered URL. A maxDepth of 0 scrapes only the entered URL. A maxDepth of 1 scrapes the entered URL and all pages one level deep. A maxDepth of 2 scrapes the entered URL and all pages up to two levels deep. Higher values follow the same pattern. */
        maxDepth: z
          .number()
          .int()
          .describe(
            'Maximum depth to crawl relative to the entered URL. A maxDepth of 0 scrapes only the entered URL. A maxDepth of 1 scrapes the entered URL and all pages one level deep. A maxDepth of 2 scrapes the entered URL and all pages up to two levels deep. Higher values follow the same pattern.'
          )
          .optional(),
        /** The crawling mode to use. Fast mode crawls 4x faster websites without sitemap, but may not be as accurate and shouldn't be used in heavy js-rendered websites. */
        mode: z
          .enum(['default', 'fast'])
          .describe(
            "The crawling mode to use. Fast mode crawls 4x faster websites without sitemap, but may not be as accurate and shouldn't be used in heavy js-rendered websites."
          )
          .default('default'),
        /** Ignore the website sitemap when crawling */
        ignoreSitemap: z
          .boolean()
          .describe('Ignore the website sitemap when crawling')
          .default(false),
        /** Maximum number of pages to crawl */
        limit: z
          .number()
          .int()
          .describe('Maximum number of pages to crawl')
          .default(10_000),
        /** Enables the crawler to navigate from a specific URL to previously linked pages. For instance, from 'example.com/product/123' back to 'example.com/product' */
        allowBackwardCrawling: z
          .boolean()
          .describe(
            "Enables the crawler to navigate from a specific URL to previously linked pages. For instance, from 'example.com/product/123' back to 'example.com/product'"
          )
          .default(false),
        /** Allows the crawler to follow links to external websites. */
        allowExternalContentLinks: z
          .boolean()
          .describe('Allows the crawler to follow links to external websites.')
          .default(false)
      })
      .optional(),
    pageOptions: z
      .object({
        /** Headers to send with the request. Can be used to send cookies, user-agent, etc. */
        headers: z
          .record(z.any())
          .describe(
            'Headers to send with the request. Can be used to send cookies, user-agent, etc.'
          )
          .optional(),
        /** Include the HTML version of the content on page. Will output a html key in the response. */
        includeHtml: z
          .boolean()
          .describe(
            'Include the HTML version of the content on page. Will output a html key in the response.'
          )
          .default(false),
        /** Include the raw HTML content of the page. Will output a rawHtml key in the response. */
        includeRawHtml: z
          .boolean()
          .describe(
            'Include the raw HTML content of the page. Will output a rawHtml key in the response.'
          )
          .default(false),
        /** Only include tags, classes and ids from the page in the final output. Use comma separated values. Example: 'script, .ad, #footer' */
        onlyIncludeTags: z
          .array(z.string())
          .describe(
            "Only include tags, classes and ids from the page in the final output. Use comma separated values. Example: 'script, .ad, #footer'"
          )
          .optional(),
        /** Only return the main content of the page excluding headers, navs, footers, etc. */
        onlyMainContent: z
          .boolean()
          .describe(
            'Only return the main content of the page excluding headers, navs, footers, etc.'
          )
          .default(false),
        /** Tags, classes and ids to remove from the page. Use comma separated values. Example: 'script, .ad, #footer' */
        removeTags: z
          .array(z.string())
          .describe(
            "Tags, classes and ids to remove from the page. Use comma separated values. Example: 'script, .ad, #footer'"
          )
          .optional(),
        /** Replace all relative paths with absolute paths for images and links */
        replaceAllPathsWithAbsolutePaths: z
          .boolean()
          .describe(
            'Replace all relative paths with absolute paths for images and links'
          )
          .default(false),
        /** Include a screenshot of the top of the page that you are scraping. */
        screenshot: z
          .boolean()
          .describe(
            'Include a screenshot of the top of the page that you are scraping.'
          )
          .default(false),
        /** Include a full page screenshot of the page that you are scraping. */
        fullPageScreenshot: z
          .boolean()
          .describe(
            'Include a full page screenshot of the page that you are scraping.'
          )
          .default(false),
        /** Wait x amount of milliseconds for the page to load to fetch content */
        waitFor: z
          .number()
          .int()
          .describe(
            'Wait x amount of milliseconds for the page to load to fetch content'
          )
          .default(0)
      })
      .optional()
  })
  export type CrawlUrlsParams = z.infer<typeof CrawlUrlsParamsSchema>

  export const CrawlUrlsResponseSchema = CrawlResponseSchema
  export type CrawlUrlsResponse = z.infer<typeof CrawlUrlsResponseSchema>

  export const SearchGoogleParamsSchema = z.object({
    /** The query to search for */
    query: z.string().url().describe('The query to search for'),
    pageOptions: z
      .object({
        /** Only return the main content of the page excluding headers, navs, footers, etc. */
        onlyMainContent: z
          .boolean()
          .describe(
            'Only return the main content of the page excluding headers, navs, footers, etc.'
          )
          .default(false),
        /** Fetch the content of each page. If false, defaults to a basic fast serp API. */
        fetchPageContent: z
          .boolean()
          .describe(
            'Fetch the content of each page. If false, defaults to a basic fast serp API.'
          )
          .default(true),
        /** Include the HTML version of the content on page. Will output a html key in the response. */
        includeHtml: z
          .boolean()
          .describe(
            'Include the HTML version of the content on page. Will output a html key in the response.'
          )
          .default(false),
        /** Include the raw HTML content of the page. Will output a rawHtml key in the response. */
        includeRawHtml: z
          .boolean()
          .describe(
            'Include the raw HTML content of the page. Will output a rawHtml key in the response.'
          )
          .default(false)
      })
      .optional(),
    searchOptions: z
      .object({
        /** Maximum number of results. Max is 20 during beta. */
        limit: z
          .number()
          .int()
          .describe('Maximum number of results. Max is 20 during beta.')
          .optional()
      })
      .optional()
  })
  export type SearchGoogleParams = z.infer<typeof SearchGoogleParamsSchema>

  export const SearchGoogleResponseSchema = SearchResponseSchema
  export type SearchGoogleResponse = z.infer<typeof SearchGoogleResponseSchema>

  export const GetCrawlStatusParamsSchema = z.object({
    /** ID of the crawl job */
    jobId: z.string().describe('ID of the crawl job')
  })
  export type GetCrawlStatusParams = z.infer<typeof GetCrawlStatusParamsSchema>

  export const GetCrawlStatusResponseSchema = z.object({
    /** Status of the job (completed, active, failed, paused) */
    status: z
      .string()
      .describe('Status of the job (completed, active, failed, paused)')
      .optional(),
    /** Current page number */
    current: z.number().int().describe('Current page number').optional(),
    /** Total number of pages */
    total: z.number().int().describe('Total number of pages').optional(),
    /** Data returned from the job (null when it is in progress) */
    data: z
      .array(CrawlStatusResponseObjSchema)
      .describe('Data returned from the job (null when it is in progress)')
      .optional(),
    /** Partial documents returned as it is being crawled (streaming). **This feature is currently in alpha - expect breaking changes** When a page is ready, it will append to the partial_data array, so there is no need to wait for the entire website to be crawled. When the crawl is done, partial_data will become empty and the result will be available in `data`. There is a max of 50 items in the array response. The oldest item (top of the array) will be removed when the new item is added to the array. */
    partial_data: z
      .array(CrawlStatusResponseObjSchema)
      .describe(
        'Partial documents returned as it is being crawled (streaming). **This feature is currently in alpha - expect breaking changes** When a page is ready, it will append to the partial_data array, so there is no need to wait for the entire website to be crawled. When the crawl is done, partial_data will become empty and the result will be available in `data`. There is a max of 50 items in the array response. The oldest item (top of the array) will be removed when the new item is added to the array.'
      )
      .optional()
  })
  export type GetCrawlStatusResponse = z.infer<
    typeof GetCrawlStatusResponseSchema
  >

  export const CancelCrawlJobParamsSchema = z.object({
    /** ID of the crawl job */
    jobId: z.string().describe('ID of the crawl job')
  })
  export type CancelCrawlJobParams = z.infer<typeof CancelCrawlJobParamsSchema>

  export const CancelCrawlJobResponseSchema = z.object({
    /** Returns cancelled. */
    status: z.string().describe('Returns cancelled.').optional()
  })
  export type CancelCrawlJobResponse = z.infer<
    typeof CancelCrawlJobResponseSchema
  >
}
