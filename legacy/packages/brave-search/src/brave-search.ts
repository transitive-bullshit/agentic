import { z } from 'zod'

export namespace bravesearch {
  export const apiBaseUrl = 'https://api.search.brave.com'

  export const SearchParamsSchema = z.object({
    query: z
      .string()
      .describe('Search query (max 400 chars, 50 words)')
      .optional(),
    count: z
      .number()
      .int()
      .min(1)
      .max(20)
      .describe('Number of results (1-20, default 10)')
      .optional(),
    offset: z
      .number()
      .describe('Pagination offset (max 9, default 0)')
      .optional()
  })
  export type SearchParams = z.infer<typeof SearchParamsSchema>

  export const LocalSearchParamsSchema = z.object({
    query: z
      .string()
      .describe('Search query (max 400 chars, 50 words)')
      .optional(),
    count: z
      .number()
      .describe('Number of results (1-20, default 10)')
      .int()
      .min(1)
      .max(20)
      .optional()
  })
  export type LocalSearchParams = z.infer<typeof LocalSearchParamsSchema>

  export interface SearchResponse {
    web?: {
      results?: Array<{
        title: string
        description: string
        url: string
        language?: string
        published?: string
        rank?: number
      }>
    }
    locations?: {
      results?: Array<{
        id: string // Required by API
        title?: string
      }>
    }
  }

  export interface Location {
    id: string
    name: string
    address: {
      streetAddress?: string
      addressLocality?: string
      addressRegion?: string
      postalCode?: string
    }
    coordinates?: {
      latitude: number
      longitude: number
    }
    phone?: string
    rating?: {
      ratingValue?: number
      ratingCount?: number
    }
    openingHours?: string[]
    priceRange?: string
  }

  export interface PoiResponse {
    results: Location[]
  }

  export interface Description {
    descriptions: { [id: string]: string }
  }

  export type LocalSearchResponse = Array<Location & { description: string }>
}
