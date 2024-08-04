import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  omit,
  pick,
  pruneUndefined
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import { z } from 'zod'

export namespace searxng {
  export const SearchCategorySchema = z.enum([
    'general',
    'images',
    'videos',
    'news',
    'map',
    'music',
    'it',
    'science',
    'files',
    'social media'
  ])
  export type SearchCategory = z.infer<typeof SearchCategorySchema>

  export const SearchEngineSchema = z.enum([
    '9gag',
    'annas archive',
    'apk mirror',
    'apple app store',
    'ahmia',
    'anaconda',
    'arch linux wiki',
    'artic',
    'arxiv',
    'ask',
    'bandcamp',
    'wikipedia',
    'bilibili',
    'bing',
    'bing images',
    'bing news',
    'bing videos',
    'bitbucket',
    'bpb',
    'btdigg',
    'ccc-tv',
    'openverse',
    'chefkoch',
    'crossref',
    'crowdview',
    'yep',
    'yep images',
    'yep news',
    'curlie',
    'currency',
    'bahnhof',
    'deezer',
    'destatis',
    'deviantart',
    'ddg definitions',
    'docker hub',
    'erowid',
    'wikidata',
    'duckduckgo',
    'duckduckgo images',
    'duckduckgo videos',
    'duckduckgo news',
    'duckduckgo weather',
    'apple maps',
    'emojipedia',
    'tineye',
    'etymonline',
    '1x',
    'fdroid',
    'flickr',
    'free software directory',
    'frinkiac',
    'fyyd',
    'genius',
    'gentoo',
    'gitlab',
    'github',
    'codeberg',
    'goodreads',
    'google',
    'google images',
    'google news',
    'google videos',
    'google scholar',
    'google play apps',
    'google play movies',
    'material icons',
    'gpodder',
    'habrahabr',
    'hackernews',
    'hoogle',
    'imdb',
    'imgur',
    'ina',
    'invidious',
    'jisho',
    'kickass',
    'lemmy communities',
    'lemmy users',
    'lemmy posts',
    'lemmy comments',
    'library genesis',
    'z-library',
    'library of congress',
    'lingva',
    'lobste.rs',
    'mastodon users',
    'mastodon hashtags',
    'mdn',
    'metacpan',
    'mixcloud',
    'mozhi',
    'mwmbl',
    'npm',
    'nyaa',
    'mankier',
    'odysee',
    'openairedatasets',
    'openairepublications',
    'openstreetmap',
    'openrepos',
    'packagist',
    'pdbe',
    'photon',
    'pinterest',
    'piped',
    'piped.music',
    'piratebay',
    'podcastindex',
    'presearch',
    'presearch images',
    'presearch videos',
    'presearch news',
    'pub.dev',
    'pubmed',
    'pypi',
    'qwant',
    'qwant news',
    'qwant images',
    'qwant videos',
    'radio browser',
    'reddit',
    'rottentomatoes',
    'sepiasearch',
    'soundcloud',
    'stackoverflow',
    'askubuntu',
    'internetarchivescholar',
    'superuser',
    'searchcode code',
    'semantic scholar',
    'startpage',
    'tokyotoshokan',
    'solidtorrents',
    'tagesschau',
    'tmdb',
    'torch',
    'unsplash',
    'yandex music',
    'yahoo',
    'yahoo news',
    'youtube',
    'dailymotion',
    'vimeo',
    'wiby',
    'alexandria',
    'wikibooks',
    'wikinews',
    'wikiquote',
    'wikisource',
    'wikispecies',
    'wiktionary',
    'wikiversity',
    'wikivoyage',
    'wikicommons.images',
    'wolframalpha',
    'dictzone',
    'mymemory translated',
    '1337x',
    'duden',
    'seznam',
    'mojeek',
    'moviepilot',
    'naver',
    'rubygems',
    'peertube',
    'mediathekviewweb',
    'yacy',
    'yacy images',
    'rumble',
    'livespace',
    'wordnik',
    'woxikon.de synonyme',
    'seekr news',
    'seekr images',
    'seekr videos',
    'sjp.pwn',
    'stract',
    'svgrepo',
    'tootfinder',
    'wallhaven',
    'wikimini',
    'wttr.in',
    'yummly',
    'brave',
    'brave.images',
    'brave.videos',
    'brave.news',
    'lib.rs',
    'sourcehut',
    'goo',
    'bt4g',
    'pkg.go.dev'
  ])
  export type SearchEngine = z.infer<typeof SearchEngineSchema>

  export const SearchOptionsSchema = z.object({
    query: z.string().describe('search query'),
    categories: z
      .array(SearchCategorySchema)
      .optional()
      .describe(
        'narrows the search to only use search engines in specific categories'
      ),
    engines: z
      .array(SearchEngineSchema)
      .optional()
      .describe('narrows the search to only use specific search engines'),
    language: z.string().optional(),
    pageno: z.number().int().optional()
  })
  export type SearchOptions = z.infer<typeof SearchOptionsSchema>

  export interface SearchResult {
    title: string
    url: string
    img_src?: string
    thumbnail_src?: string
    thumbnail?: string
    content?: string
    author?: string
    iframe_src?: string
    category?: SearchCategory
    engine?: SearchEngine
    publishedDate?: string
  }

  export interface SearchResponse {
    results: SearchResult[]
    suggestions: string[]
    query: string
  }
}

/**
 * Open source meta search engine capable of searching across many different
 * sources and search engines.
 *
 * The most important search engines are:
 *
 * - "reddit" (Reddit posts)
 * - "google" (Google web search)
 * - "google news" (Google News search)
 * - "brave" (Brave web search)
 * - "arxiv" (academic papers)
 * - "genius" (Genius.com for song lyrics)
 * - "imdb" (movies and TV shows)
 * - "hackernews" (Hacker News)
 * - "wikidata" (Wikidata)
 * - "wolframalpha" (Wolfram Alpha)
 * - "youtube" (YouTube videos)
 * - "github" (GitHub code and repositories)
 *
 * @see https://docs.searxng.org
 *
 * NOTE: You'll need to run a local instance of Searxng to use this client.
 *
 * See [perplexica](https://github.com/ItzCrazyKns/Perplexica/blob/master/docker-compose.yaml) for an example of how to set this up.
 */
export class SearxngClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiBaseUrl: string

  constructor({
    apiBaseUrl = getEnv('SEARXNG_API_BASE_URL'),
    ky = defaultKy
  }: {
    apiBaseUrl?: string
    ky?: KyInstance
  } = {}) {
    assert(
      apiBaseUrl,
      'SearxngClient missing required "apiBaseUrl" (defaults to "SEARXNG_API_BASE_URL")'
    )
    super()

    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({ prefixUrl: apiBaseUrl })
  }

  @aiFunction({
    name: 'searxng',
    description: `Searches across multiple search engines using a local instance of Searxng. To search only specific engines, use the \`engines\` parameter.

The most important search engines are:

- "reddit" (Reddit posts)
- "google" (Google web search)
- "google news" (Google News search)
- "brave" (Brave web search)
- "arxiv" (academic papers)
- "genius" (Genius.com for song lyrics)
- "imdb" (movies and TV shows)
- "hackernews" (Hacker News)
- "wikidata" (Wikidata)
- "wolframalpha" (Wolfram Alpha)
- "youtube" (YouTube videos)
- "github" (GitHub code and repositories)
`,
    inputSchema: searxng.SearchOptionsSchema
  })
  async search({
    query,
    ...opts
  }: searxng.SearchOptions): Promise<searxng.SearchResponse> {
    const res = await this.ky
      .get('search', {
        searchParams: pruneUndefined({
          ...opts,
          q: query,
          categories: opts.categories?.join(','),
          engines: opts.engines?.join(','),
          format: 'json'
        })
      })
      .json<searxng.SearchResponse>()

    res.results = res.results?.map(
      (result: any) =>
        omit(
          result,
          'parsed_url',
          'engines',
          'positions',
          'template'
        ) as searxng.SearchResult
    )

    return pick(res, 'results', 'suggestions', 'query')
  }
}
