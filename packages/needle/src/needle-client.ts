import { aiFunction, AIFunctionsProvider, assert, getEnv } from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import { z } from 'zod'

export interface FileToAdd {
  url: string
  name: string
}

export interface SearchResult {
  id: string
  content: string
  file_id: string
  score?: number
}

export interface Collection {
  id: string
  name: string
  description?: string
  created_at: string
  search_queries?: number
}

export interface FileResult {
  id: string
  content: string
  metadata?: Record<string, any>
}

interface ApiResponse<T> {
  result: T
}

/**
 * Needle API client for RAG-based agentic applications.
 *
 * @see https://needle-ai.com
 */
export class NeedleClient {
  protected readonly ky: KyInstance
  protected readonly searchKy: KyInstance
  public readonly collections: CollectionsAPI

  constructor({
    apiKey = getEnv('NEEDLE_API_KEY'),
    apiBaseUrl = getEnv('NEEDLE_API_BASE_URL') ??
      'https://needle-ai.com/api/v1',
    searchBaseUrl = 'https://search.needle-ai.com/api/v1',
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    searchBaseUrl?: string
    ky?: KyInstance
  } = {}) {
    assert(apiKey, 'NeedleClient missing required "apiKey"')

    this.ky = ky.extend({
      prefixUrl: apiBaseUrl,
      headers: {
        Accept: 'application/json',
        'x-api-key': apiKey
      }
    })

    this.searchKy = ky.extend({
      prefixUrl: searchBaseUrl,
      headers: {
        Accept: 'application/json',
        'x-api-key': apiKey
      }
    })

    this.collections = new CollectionsAPI(this.ky, this.searchKy)
  }
}

class CollectionsAPI extends AIFunctionsProvider {
  constructor(
    private readonly ky: KyInstance,
    private readonly searchKy: KyInstance
  ) {
    super()
  }

  @aiFunction({
    name: 'search_collection',
    description: 'Search for relevant content in a collection',
    inputSchema: z.object({
      collection_id: z.string().describe('ID of the collection to search'),
      text: z.string().describe('Search query text'),
      top_k: z
        .number()
        .optional()
        .describe('Maximum number of results to return'),
      max_distance: z
        .number()
        .optional()
        .describe('Maximum semantic distance for results'),
      labels: z
        .array(z.array(z.string()))
        .optional()
        .describe('Optional labels to filter results')
    })
  })
  async search(input: {
    collection_id: string
    text: string
    top_k?: number
    max_distance?: number
    labels?: string[][]
  }): Promise<SearchResult[]> {
    const response = await this.searchKy
      .post(`collections/${input.collection_id}/search`, {
        json: {
          text: input.text,
          top_k: input.top_k,
          max_distance: input.max_distance,
          labels: input.labels
        }
      })
      .json<ApiResponse<SearchResult[]>>()
    return response.result
  }

  @aiFunction({
    name: 'create_collection',
    description: 'Create a new collection',
    inputSchema: z.object({
      name: z.string().describe('Name of the collection'),
      description: z
        .string()
        .optional()
        .describe('Description of the collection')
    })
  })
  async create(input: {
    name: string
    description?: string
  }): Promise<Collection> {
    const response = await this.ky
      .post('collections', {
        json: input
      })
      .json<ApiResponse<Collection>>()
    return response.result
  }

  @aiFunction({
    name: 'get_collection',
    description: 'Get a collection by ID',
    inputSchema: z.object({
      id: z.string().describe('ID of the collection to retrieve')
    })
  })
  async get(input: { id: string }): Promise<Collection> {
    const response = await this.ky
      .get(`collections/${input.id}`)
      .json<ApiResponse<Collection>>()
    return response.result
  }

  @aiFunction({
    name: 'list_collections',
    description: 'List all collections',
    inputSchema: z.object({}).strict()
  })
  async list(): Promise<Collection[]> {
    const response = await this.ky
      .get('collections')
      .json<ApiResponse<Collection[]>>()
    return response.result
  }

  @aiFunction({
    name: 'add_file',
    description: 'Add a file to a collection by URL',
    inputSchema: z.object({
      collection_id: z
        .string()
        .describe('ID of the collection to add the file to'),
      files: z
        .array(
          z.object({
            url: z.string().describe('URL of the file to add'),
            name: z.string().describe('Name of the file')
          })
        )
        .describe('Array of files to add')
    })
  })
  async addFile(input: {
    collection_id: string
    files: FileToAdd[]
  }): Promise<FileResult[]> {
    const response = await this.ky
      .post(`collections/${input.collection_id}/files`, {
        json: {
          files: input.files
        }
      })
      .json<ApiResponse<FileResult[]>>()
    return response.result
  }
}
