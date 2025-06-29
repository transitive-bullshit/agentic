import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  sanitizeSearchParams
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import { z } from 'zod'

import { airtable } from './airtable'

/**
 * Airtable API client.
 *
 * @see https://airtable.com/developers/web/api/introduction
 */
export class AirtableClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiKey: string
  protected readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('AIRTABLE_API_KEY'),
    apiBaseUrl = airtable.API_BASE_URL,
    timeoutMs = 60_000,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    timeoutMs?: number
    ky?: KyInstance
  } = {}) {
    assert(
      apiKey,
      `AirtableClient missing required "apiKey" (defaults to "AIRTABLE_API_KEY")`
    )
    super()

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({
      prefixUrl: apiBaseUrl,
      timeout: timeoutMs,
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    })
  }

  /**
   * Lists all of the bases that the user has access to.
   */
  @aiFunction({
    name: 'airtable_list_bases',
    description: 'Lists all accessible Airtable bases.',
    inputSchema: z.object({})
  })
  async listBases(): Promise<airtable.ListBasesResponse> {
    return this.ky.get('v0/meta/bases').json<airtable.ListBasesResponse>()
  }

  /**
   * Lists all of the tables in a base.
   */
  @aiFunction({
    name: 'airtable_list_tables',
    description: 'Lists all of the tables in a base.',
    inputSchema: airtable.ListTablesArgsSchema
  })
  async listTables<
    TDetailLevel extends airtable.TableDetailLevel = 'full'
  >(args: {
    baseId: string
    detailLevel?: TDetailLevel
  }): Promise<Array<airtable.AirtableTableToDetailLevel<TDetailLevel>>> {
    const { baseId, detailLevel = 'full' } = args

    const res = await this.ky
      .get(`/v0/meta/bases/${baseId}/tables`)
      .json<airtable.BaseSchemaResponse>()

    return res.tables.map((table) =>
      transformTableDetailLevel<TDetailLevel>({
        table,
        detailLevel: detailLevel as TDetailLevel
      })
    )
  }

  /**
   * Gets a single table's schema in a base.
   */
  @aiFunction({
    name: 'airtable_get_table',
    description: "Gets a single table's schema in a base.",
    inputSchema: airtable.DescribeTableArgsSchema
  })
  async getTable<
    TDetailLevel extends airtable.TableDetailLevel = 'full'
  >(args: {
    baseId: string
    tableId: string
    detailLevel?: TDetailLevel
  }): Promise<airtable.AirtableTableToDetailLevel<TDetailLevel>> {
    const tables = await this.listTables<TDetailLevel>(args)
    const table = tables.find((t) => t.id === args.tableId)
    assert(table, `Table ${args.tableId} not found in base ${args.baseId}`)
    return table
  }

  /**
   * Lists records from a table.
   */
  @aiFunction({
    name: 'airtable_list_records',
    description: 'Lists records from a table.',
    inputSchema: airtable.ListRecordsArgsSchema
  })
  async listRecords(
    args: airtable.ListRecordsArgs
  ): Promise<airtable.AirtableRecord[]> {
    const { baseId, tableId, ...options } = args
    return this.ky
      .get(`/v0/${baseId}/${tableId}`, {
        searchParams: sanitizeSearchParams(options)
      })
      .json<airtable.AirtableRecord[]>()
  }

  /**
   * Lists all records from a table.
   */
  @aiFunction({
    name: 'airtable_list_all_records',
    description: 'Lists all records from a table.',
    inputSchema: airtable.ListRecordsArgsSchema
  })
  async listAllRecords(
    args: airtable.ListRecordsArgs
  ): Promise<airtable.AirtableRecord[]> {
    const allRecords: airtable.AirtableRecord[] = []
    let offset = args.offset ?? 0

    do {
      const res = await this.listRecords({
        ...args,
        offset
      })
      if (!res.length) {
        break
      }

      allRecords.push(...res)
      offset += res.length
    } while (true)

    return allRecords
  }

  /**
   * Gets a single record from a table.
   */
  @aiFunction({
    name: 'airtable_get_record',
    description: 'Gets a single record from a table.',
    inputSchema: airtable.GetRecordArgsSchema
  })
  async getRecord(
    args: airtable.GetRecordArgs
  ): Promise<airtable.AirtableRecord> {
    const { baseId, tableId, recordId } = args
    return this.ky
      .get(`/v0/${baseId}/${tableId}/${recordId}`)
      .json<airtable.AirtableRecord>()
  }

  /**
   * Creates a record in a table.
   */
  @aiFunction({
    name: 'airtable_create_record',
    description: 'Creates a record in a table.',
    inputSchema: airtable.CreateRecordArgsSchema
  })
  async createRecord(
    args: airtable.CreateRecordArgs
  ): Promise<airtable.AirtableRecord> {
    const { baseId, tableId, ...body } = args
    return this.ky
      .post(`/v0/${baseId}/${tableId}`, {
        json: body
      })
      .json<airtable.AirtableRecord>()
  }

  /**
   * Updates records in a table.
   */
  @aiFunction({
    name: 'airtable_update_records',
    description: 'Updates records in a table.',
    inputSchema: airtable.UpdateRecordsArgsSchema
  })
  async updateRecords(
    args: airtable.UpdateRecordsArgs
  ): Promise<airtable.AirtableRecord[]> {
    const { baseId, tableId, ...body } = args
    return this.ky
      .patch(`/v0/${baseId}/${tableId}`, {
        json: body
      })
      .json<airtable.AirtableRecord[]>()
  }

  /**
   * Deletes records from a table.
   */
  @aiFunction({
    name: 'airtable_delete_records',
    description: 'Deletes records from a table.',
    inputSchema: airtable.DeleteRecordsArgsSchema
  })
  async deleteRecords(
    args: airtable.DeleteRecordsArgs
  ): Promise<{ id: string }[]> {
    const { baseId, tableId, recordIds } = args
    const queryString = recordIds.map((id) => `records[]=${id}`).join('&')

    const res = await this.ky
      .delete(`/v0/${baseId}/${tableId}?${queryString}`)
      .json<{ records: { id: string; deleted: boolean }[] }>()

    return res.records.map(({ id }) => ({ id }))
  }

  /**
   * Creates a table in a base.
   */
  @aiFunction({
    name: 'airtable_create_table',
    description: 'Creates a table in a base.',
    inputSchema: airtable.CreateTableArgsSchema
  })
  async createTable(args: airtable.CreateTableArgs): Promise<airtable.Table> {
    const { baseId, ...body } = args

    return this.ky
      .post(`/v0/meta/bases/${baseId}/tables`, {
        json: body
      })
      .json<airtable.Table>()
  }

  /**
   * Updates a table in a base.
   */
  @aiFunction({
    name: 'airtable_update_table',
    description: 'Updates a table in a base.',
    inputSchema: airtable.UpdateTableArgsSchema
  })
  async updateTable(args: airtable.UpdateTableArgs): Promise<airtable.Table> {
    const { baseId, tableId, ...body } = args
    return this.ky
      .patch(`/v0/meta/bases/${baseId}/tables/${tableId}`, {
        json: body
      })
      .json<airtable.Table>()
  }

  /**
   * Creates a field in a table.
   */
  @aiFunction({
    name: 'airtable_create_field',
    description: 'Creates a field in a table.',
    inputSchema: airtable.CreateFieldArgsSchema
  })
  async createField(args: airtable.CreateFieldArgs): Promise<airtable.Field> {
    const { baseId, tableId, body } = args
    return this.ky
      .post(`/v0/meta/bases/${baseId}/tables/${tableId}/fields`, {
        json: body.field
      })
      .json<airtable.Field>()
  }

  /**
   * Updates a field in a table.
   */
  @aiFunction({
    name: 'airtable_update_field',
    description: 'Updates a field in a table.',
    inputSchema: airtable.UpdateFieldArgsSchema
  })
  async updateField(args: airtable.UpdateFieldArgs): Promise<airtable.Field> {
    const { baseId, tableId, fieldId, ...body } = args
    return this.ky
      .patch(`/v0/meta/bases/${baseId}/tables/${tableId}/fields/${fieldId}`, {
        json: body
      })
      .json<airtable.Field>()
  }

  /**
   * Searches for records in a table which contain specific text.
   */
  @aiFunction({
    name: 'airtable_search_records',
    description: 'Searches for records in a table which contain specific text.',
    inputSchema: airtable.SearchRecordsArgsSchema
  })
  async searchRecords(
    args: airtable.SearchRecordsArgs
  ): Promise<airtable.AirtableRecord[]> {
    const { baseId, tableId, fieldIds, searchTerm, ...opts } = args
    // Validate and get search fields
    const searchFieldIds = await this.validateAndGetSearchFields({
      baseId,
      tableId,
      fieldIds
    })

    // Escape the search term to prevent formula injection
    const escapedSearchTerm = searchTerm.replaceAll(/["\\]/g, '\\$&')

    // Build OR(FIND("term", field1), FIND("term", field2), ...)
    const filterByFormula = `OR(${searchFieldIds
      .map((fieldId) => `FIND("${escapedSearchTerm}", {${fieldId}})`)
      .join(',')})`

    return this.listRecords({ ...opts, baseId, tableId, filterByFormula })
  }

  /**
   * Validates and gets the searchable text fields in a table.
   */
  protected async validateAndGetSearchFields({
    baseId,
    tableId,
    fieldIds
  }: {
    baseId: string
    tableId: string
    fieldIds?: string[]
  }): Promise<string[]> {
    const table = await this.getTable({ baseId, tableId })

    const searchableFieldTypes = new Set([
      'singleLineText',
      'multilineText',
      'richText',
      'email',
      'url',
      'phoneNumber'
    ])

    const searchableFieldIds = new Set(
      table.fields
        .filter((field) => searchableFieldTypes.has(field.type))
        .map((field) => field.id)
    )

    if (!searchableFieldIds.size) {
      throw new Error('No text fields available to search')
    }

    // If specific fields were requested, validate that they exist and are, in
    // fact, valid searchable text fields.
    if (fieldIds && fieldIds.length > 0) {
      // Check if any requested fields were invalid
      const invalidFieldIds = fieldIds.filter(
        (fieldId) => !searchableFieldIds.has(fieldId)
      )
      if (invalidFieldIds.length > 0) {
        throw new Error(
          `Invalid fields requested: ${invalidFieldIds.join(', ')}`
        )
      }

      return fieldIds
    }

    return Array.from(searchableFieldIds)
  }
}

function transformTableDetailLevel<
  T extends airtable.TableDetailLevel = 'full'
>({
  table,
  detailLevel
}: {
  table: airtable.Table
  detailLevel: T
}): airtable.AirtableTableToDetailLevel<T> {
  switch (detailLevel) {
    case 'tableIdentifiersOnly':
      return {
        id: table.id,
        name: table.name
      } as any

    case 'identifiersOnly':
      return {
        id: table.id,
        name: table.name,
        fields: table.fields.map((field) => ({
          id: field.id,
          name: field.name
        })),
        views: table.views.map((view) => ({
          id: view.id,
          name: view.name
        }))
      } as any

    default:
      return table as any
  }
}
