/**
 * This file was auto-generated from an OpenAPI spec.
 */

import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  pick,
  sanitizeSearchParams
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'

import { notion } from './notion'

/**
 * Agentic Notion client.
 *
 * API specification for Notion.
 */
export class NotionClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiKey: string
  protected readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('NOTION_API_KEY'),
    apiBaseUrl = notion.apiBaseUrl,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: KyInstance
  } = {}) {
    assert(
      apiKey,
      'NotionClient missing required "apiKey" (defaults to "NOTION_API_KEY")'
    )
    super()

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({
      prefixUrl: apiBaseUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    })
  }

  /**
   * Get current user.
   */
  @aiFunction({
    name: 'notion_get_self',
    description: `Get current user.`,
    inputSchema: notion.GetSelfParamsSchema
  })
  async getSelf(
    _params: notion.GetSelfParams
  ): Promise<notion.GetSelfResponse> {
    return this.ky.get('/users/me').json<notion.GetSelfResponse>()
  }

  /**
   * Get user.
   */
  @aiFunction({
    name: 'notion_get_user',
    description: `Get user.`,
    inputSchema: notion.GetUserParamsSchema
  })
  async getUser(params: notion.GetUserParams): Promise<notion.GetUserResponse> {
    return this.ky
      .get(`/users/${params.user_id}`)
      .json<notion.GetUserResponse>()
  }

  /**
   * List users.
   */
  @aiFunction({
    name: 'notion_list_users',
    description: `List users.`,
    inputSchema: notion.ListUsersParamsSchema
  })
  async listUsers(
    params: notion.ListUsersParams
  ): Promise<notion.ListUsersResponse> {
    return this.ky
      .get('/users', {
        searchParams: sanitizeSearchParams(
          pick(params, 'start_cursor', 'page_size')
        )
      })
      .json<notion.ListUsersResponse>()
  }

  /**
   * Create page.
   */
  @aiFunction({
    name: 'notion_create_page',
    description: `Create page.`,
    inputSchema: notion.CreatePageParamsSchema
  })
  async createPage(
    params: notion.CreatePageParams
  ): Promise<notion.CreatePageResponse> {
    return this.ky
      .post('/pages', {
        json: pick(params, 'parent', 'properties')
      })
      .json<notion.CreatePageResponse>()
  }

  /**
   * Get page.
   */
  @aiFunction({
    name: 'notion_get_page',
    description: `Get page.`,
    inputSchema: notion.GetPageParamsSchema
  })
  async getPage(params: notion.GetPageParams): Promise<notion.GetPageResponse> {
    return this.ky
      .get(`/pages/${params.page_id}`, {
        searchParams: sanitizeSearchParams(pick(params, 'filter_properties'))
      })
      .json<notion.GetPageResponse>()
  }

  /**
   * Update page.
   */
  @aiFunction({
    name: 'notion_update_page',
    description: `Update page.`,
    inputSchema: notion.UpdatePageParamsSchema
  })
  async updatePage(
    params: notion.UpdatePageParams
  ): Promise<notion.UpdatePageResponse> {
    return this.ky
      .patch(`/pages/${params.page_id}`, {
        json: pick(params, 'properties', 'archived')
      })
      .json<notion.UpdatePageResponse>()
  }

  /**
   * Get page property.
   */
  @aiFunction({
    name: 'notion_get_page_property',
    description: `Get page property.`,
    inputSchema: notion.GetPagePropertyParamsSchema
  })
  async getPageProperty(
    params: notion.GetPagePropertyParams
  ): Promise<notion.GetPagePropertyResponse> {
    return this.ky
      .get(`/pages/${params.page_id}/properties/${params.property_id}`, {
        searchParams: sanitizeSearchParams(
          pick(params, 'start_cursor', 'page_size')
        )
      })
      .json<notion.GetPagePropertyResponse>()
  }

  /**
   * Get block.
   */
  @aiFunction({
    name: 'notion_get_block',
    description: `Get block.`,
    inputSchema: notion.GetBlockParamsSchema
  })
  async getBlock(
    params: notion.GetBlockParams
  ): Promise<notion.GetBlockResponse> {
    return this.ky
      .get(`/blocks/${params.block_id}`)
      .json<notion.GetBlockResponse>()
  }

  /**
   * Delete block.
   */
  @aiFunction({
    name: 'notion_delete_block',
    description: `Delete block.`,
    inputSchema: notion.DeleteBlockParamsSchema
  })
  async deleteBlock(
    params: notion.DeleteBlockParams
  ): Promise<notion.DeleteBlockResponse> {
    return this.ky
      .delete(`/blocks/${params.block_id}`)
      .json<notion.DeleteBlockResponse>()
  }

  /**
   * Update block.
   */
  @aiFunction({
    name: 'notion_update_block',
    description: `Update block.`,
    inputSchema: notion.UpdateBlockParamsSchema
  })
  async updateBlock(
    params: notion.UpdateBlockParams
  ): Promise<notion.UpdateBlockResponse> {
    return this.ky
      .patch(`/blocks/${params.block_id}`, {
        json: pick(
          params,
          'paragraph',
          'heading_1',
          'heading_2',
          'heading_3',
          'bulleted_list_item',
          'numbered_list_item',
          'quote',
          'to_do',
          'toggle',
          'code',
          'embed',
          'image',
          'video',
          'file',
          'pdf',
          'bookmark',
          'equation',
          'divider',
          'table_of_contents',
          'breadcrumb',
          'column_list',
          'column',
          'link_to_page',
          'table_row',
          'archived'
        )
      })
      .json<notion.UpdateBlockResponse>()
  }

  /**
   * List block children.
   */
  @aiFunction({
    name: 'notion_list_block_children',
    description: `List block children.`,
    inputSchema: notion.ListBlockChildrenParamsSchema
  })
  async listBlockChildren(
    params: notion.ListBlockChildrenParams
  ): Promise<notion.ListBlockChildrenResponse> {
    return this.ky
      .get(`/blocks/${params.block_id}/children`, {
        searchParams: sanitizeSearchParams(
          pick(params, 'start_cursor', 'page_size')
        )
      })
      .json<notion.ListBlockChildrenResponse>()
  }

  /**
   * Append block children.
   */
  @aiFunction({
    name: 'notion_append_block_children',
    description: `Append block children.`,
    inputSchema: notion.AppendBlockChildrenParamsSchema
  })
  async appendBlockChildren(
    params: notion.AppendBlockChildrenParams
  ): Promise<notion.AppendBlockChildrenResponse> {
    return this.ky
      .patch(`/blocks/${params.block_id}/children`, {
        json: pick(params, 'children')
      })
      .json<notion.AppendBlockChildrenResponse>()
  }

  /**
   * Get database.
   */
  @aiFunction({
    name: 'notion_get_database',
    description: `Get database.`,
    inputSchema: notion.GetDatabaseParamsSchema
  })
  async getDatabase(
    params: notion.GetDatabaseParams
  ): Promise<notion.GetDatabaseResponse> {
    return this.ky
      .get(`/databases/${params.database_id}`)
      .json<notion.GetDatabaseResponse>()
  }

  /**
   * Update database.
   */
  @aiFunction({
    name: 'notion_update_database',
    description: `Update database.`,
    inputSchema: notion.UpdateDatabaseParamsSchema
  })
  async updateDatabase(
    params: notion.UpdateDatabaseParams
  ): Promise<notion.UpdateDatabaseResponse> {
    return this.ky
      .patch(`/databases/${params.database_id}`, {
        json: pick(
          params,
          'title',
          'description',
          'icon',
          'cover',
          'properties',
          'is_inline',
          'archived'
        )
      })
      .json<notion.UpdateDatabaseResponse>()
  }

  /**
   * Query database.
   */
  @aiFunction({
    name: 'notion_query_database',
    description: `Query database.`,
    inputSchema: notion.QueryDatabaseParamsSchema
  })
  async queryDatabase(
    params: notion.QueryDatabaseParams
  ): Promise<notion.QueryDatabaseResponse> {
    return this.ky
      .post(`/databases/${params.database_id}/query`, {
        searchParams: sanitizeSearchParams(pick(params, 'filter_properties')),
        json: pick(
          params,
          'sorts',
          'filter',
          'start_cursor',
          'page_size',
          'archived'
        )
      })
      .json<notion.QueryDatabaseResponse>()
  }

  /**
   * List databases.
   */
  @aiFunction({
    name: 'notion_list_databases',
    description: `List databases.`,
    inputSchema: notion.ListDatabasesParamsSchema
  })
  async listDatabases(
    params: notion.ListDatabasesParams
  ): Promise<notion.ListDatabasesResponse> {
    return this.ky
      .get('/databases', {
        searchParams: sanitizeSearchParams(
          pick(params, 'start_cursor', 'page_size')
        )
      })
      .json<notion.ListDatabasesResponse>()
  }

  /**
   * Create database.
   */
  @aiFunction({
    name: 'notion_create_database',
    description: `Create database.`,
    inputSchema: notion.CreateDatabaseParamsSchema
  })
  async createDatabase(
    params: notion.CreateDatabaseParams
  ): Promise<notion.CreateDatabaseResponse> {
    return this.ky
      .post('/databases', {
        json: pick(
          params,
          'parent',
          'properties',
          'icon',
          'cover',
          'title',
          'description',
          'is_inline'
        )
      })
      .json<notion.CreateDatabaseResponse>()
  }

  /**
   * Search.
   */
  @aiFunction({
    name: 'notion_search',
    description: `Search.`,
    inputSchema: notion.SearchParamsSchema
  })
  async search(params: notion.SearchParams): Promise<notion.SearchResponse> {
    return this.ky
      .post('/search', {
        json: pick(
          params,
          'query',
          'sort',
          'filter',
          'start_cursor',
          'page_size'
        )
      })
      .json<notion.SearchResponse>()
  }

  /**
   * List comments.
   */
  @aiFunction({
    name: 'notion_list_comments',
    description: `List comments.`,
    inputSchema: notion.ListCommentsParamsSchema
  })
  async listComments(
    params: notion.ListCommentsParams
  ): Promise<notion.ListCommentsResponse> {
    return this.ky
      .get('/comments', {
        searchParams: sanitizeSearchParams(
          pick(params, 'block_id', 'start_cursor', 'page_size')
        )
      })
      .json<notion.ListCommentsResponse>()
  }

  /**
   * Create comment.
   */
  @aiFunction({
    name: 'notion_create_comment',
    description: `Create comment.`,
    // TODO: Improve handling of union params
    inputSchema: notion.CreateCommentParamsSchema as any
  })
  async createComment(
    params: notion.CreateCommentParams
  ): Promise<notion.CreateCommentResponse> {
    return this.ky
      .post('/comments', {
        json: params
      })
      .json<notion.CreateCommentResponse>()
  }

  /**
   * OAuth token.
   */
  @aiFunction({
    name: 'notion_oauth_token',
    description: `OAuth token.`,
    inputSchema: notion.OauthTokenParamsSchema
  })
  async oauthToken(
    params: notion.OauthTokenParams
  ): Promise<notion.OauthTokenResponse> {
    return this.ky
      .post('/oauth/token', {
        json: pick(
          params,
          'grant_type',
          'code',
          'redirect_uri',
          'external_account'
        )
      })
      .json<notion.OauthTokenResponse>()
  }
}
