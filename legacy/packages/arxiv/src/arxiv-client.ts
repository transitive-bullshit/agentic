import {
  aiFunction,
  AIFunctionsProvider,
  pruneEmpty,
  sanitizeSearchParams
} from '@agentic/core'
import { XMLParser } from 'fast-xml-parser'
import defaultKy, { type KyInstance } from 'ky'
import { z } from 'zod'

import { castArray, getProp } from './utils'

export namespace arxiv {
  export const API_BASE_URL = 'https://export.arxiv.org/api'

  export const SortType = {
    RELEVANCE: 'relevance',
    LAST_UPDATED_DATE: 'lastUpdatedDate',
    SUBMITTED_DATE: 'submittedDate'
  } as const

  export const SortOrder = {
    ASCENDING: 'ascending',
    DESCENDING: 'descending'
  } as const

  export const FilterType = {
    ALL: 'all',
    TITLE: 'title',
    AUTHOR: 'author',
    ABSTRACT: 'abstract',
    COMMENT: 'comment',
    JOURNAL_REFERENCE: 'journal_reference',
    SUBJECT_CATEGORY: 'subject_category',
    REPORT_NUMBER: 'report_number'
  } as const

  export type ValueOf<T extends NonNullable<unknown>> = T[keyof T]
  export const FilterTypeMapping: Record<ValueOf<typeof FilterType>, string> = {
    all: 'all',
    title: 'ti',
    author: 'au',
    abstract: 'abs',
    comment: 'co',
    journal_reference: 'jr',
    subject_category: 'cat',
    report_number: 'rn'
  }

  export const Separators = {
    AND: '+AND+',
    OR: '+OR+',
    ANDNOT: '+ANDNOT+'
  } as const

  export interface ArXivResponse {
    totalResults: number
    startIndex: number
    itemsPerPage: number
    entries: {
      id: string
      title: string
      summary: string
      published: string
      updated: string
      authors: { name: string; affiliation: string[] }[]
      doi: string
      comment: string
      journalReference: string
      primaryCategory: string
      categories: string[]
      links: string[]
    }[]
  }

  export const extractId = (value: string) =>
    value
      .replace('https://arxiv.org/abs/', '')
      .replace('https://arxiv.org/pdf/', '')
      .replace(/v\d$/, '')

  const EntrySchema = z.object({
    field: z.nativeEnum(FilterType).default(FilterType.ALL),
    value: z.string().min(1)
  })

  export const SearchParamsSchema = z
    .object({
      ids: z.array(z.string().min(1)).optional(),
      searchQuery: z
        .union([
          z.string(),
          z.object({
            include: z
              .array(EntrySchema)
              .nonempty()
              .describe('Filters to include results.'),
            exclude: z
              .array(EntrySchema)
              .optional()
              .describe('Filters to exclude results.')
          })
        ])
        .optional(),
      start: z.number().int().min(0).default(0),
      maxResults: z.number().int().min(1).max(100).default(5)
    })
    .describe('Sorting by date is not supported.')
  export type SearchParams = z.infer<typeof SearchParamsSchema>
}

/**
 * Lightweight wrapper around ArXiv for academic / scholarly research articles.
 *
 * @see https://arxiv.org
 */
export class ArXivClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiBaseUrl: string

  constructor({
    apiBaseUrl = arxiv.API_BASE_URL,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: KyInstance
  }) {
    super()

    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({
      prefixUrl: this.apiBaseUrl
    })
  }

  /**
   * Searches for research articles published on arXiv.
   */
  @aiFunction({
    name: 'arxiv_search',
    description: 'Searches for research articles published on arXiv.',
    inputSchema: arxiv.SearchParamsSchema
  })
  async search(queryOrOpts: string | arxiv.SearchParams) {
    const opts =
      typeof queryOrOpts === 'string'
        ? ({ searchQuery: queryOrOpts } as arxiv.SearchParams)
        : queryOrOpts

    if (!opts.ids?.length && !opts.searchQuery) {
      throw new Error(
        `The 'searchQuery' property must be non-empty if the 'ids' property is not provided.`
      )
    }

    const searchParams = sanitizeSearchParams({
      start: opts.start,
      max_results: opts.maxResults,
      id_list: opts.ids?.map(arxiv.extractId),
      search_query: opts.searchQuery
        ? typeof opts.searchQuery === 'string'
          ? opts.searchQuery
          : [
              opts.searchQuery.include
                .map(
                  (tag) => `${arxiv.FilterTypeMapping[tag.field]}:${tag.value}`
                )
                .join(arxiv.Separators.AND),
              (opts.searchQuery.exclude ?? [])
                .map(
                  (tag) => `${arxiv.FilterTypeMapping[tag.field]}:${tag.value}`
                )
                .join(arxiv.Separators.ANDNOT)
            ]
              .filter(Boolean)
              .join(arxiv.Separators.ANDNOT)
        : undefined,
      sortBy: arxiv.SortType.RELEVANCE,
      sortOrder: arxiv.SortOrder.DESCENDING
    })

    const responseText = await this.ky.get('query', { searchParams }).text()

    const parser = new XMLParser({
      allowBooleanAttributes: true,
      alwaysCreateTextNode: false,
      attributeNamePrefix: '@_',
      attributesGroupName: false,
      cdataPropName: '#cdata',
      ignoreAttributes: true,
      numberParseOptions: { hex: false, leadingZeros: true },
      parseAttributeValue: false,
      parseTagValue: true,
      preserveOrder: false,
      removeNSPrefix: true,
      textNodeName: '#text',
      trimValues: true,
      ignoreDeclaration: true
    })

    const parsedData = parser.parse(responseText)

    let entries: Record<string, any>[] = getProp(
      parsedData,
      ['feed', 'entry'],
      []
    )
    entries = castArray(entries)

    return {
      totalResults: Math.max(
        getProp(parsedData, ['feed', 'totalResults'], 0),
        entries.length
      ),
      startIndex: getProp(parsedData, ['feed', 'startIndex'], 0),
      itemsPerPage: getProp(parsedData, ['feed', 'itemsPerPage'], 0),
      entries: entries.map((entry) =>
        pruneEmpty({
          id: arxiv.extractId(entry.id),
          url: entry.id,
          title: entry.title,
          summary: entry.summary,
          published: entry.published,
          updated: entry.updated,
          authors: castArray(entry.author)
            .filter(Boolean)
            .map((author: any) => ({
              name: author.name,
              affiliation: castArray(author.affiliation ?? [])
            })),
          doi: entry.doi,
          comment: entry.comment,
          journalReference: entry.journal_ref,
          primaryCategory: entry.primary_category,
          categories: castArray(entry.category).filter(Boolean),
          links: castArray(entry.link).filter(Boolean)
        })
      )
    }
  }
}
