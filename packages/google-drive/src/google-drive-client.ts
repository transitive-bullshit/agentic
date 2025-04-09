import type * as google from 'googleapis'
import {
  aiFunction,
  AIFunctionsProvider,
  pick,
  pruneNullOrUndefinedDeep
} from '@agentic/core'
import { z } from 'zod'

export namespace googleDrive {
  export interface File {
    id?: string
    name: string
    mimeType: string
    webViewLink?: string
    webContentLink?: string
    size?: string
    createdTime?: string
    modifiedTime?: string
    parents?: string[]
  }

  export const fileFields: readonly (keyof File)[] = [
    'id',
    'name',
    'mimeType',
    'webViewLink',
    'webContentLink',
    'size',
    'createdTime',
    'modifiedTime',
    'parents'
  ]
  export const requestFileFields = `files(${fileFields.join(',')}),nextPageToken`

  export interface ListFilesResponse {
    files: File[]
    nextPageToken?: string
  }

  export interface DownloadResponse {
    content: string
    metadata: File
  }

  export const ListFilesParamsSchema = z.object({
    folderId: z.string().optional(),
    query: z.string().optional(),
    pageSize: z.number().optional(),
    pageToken: z.string().optional()
  })
}

/**
 * Simplified Drive API client.
 *
 * @see https://developers.google.com/workspace/drive/api
 *
 * @example
 * ```ts
 * import { GoogleAuth } from 'google-auth-library'
 * import { google } from 'googleapis'
 *
 * const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/drive' })
 * const drive = google.drive({ version: 'v3', auth })
 * const client = new GoogleDriveClient({ drive })
 * ```
 */
export class GoogleDriveClient extends AIFunctionsProvider {
  protected readonly drive: google.drive_v3.Drive

  constructor({ drive }: { drive: google.drive_v3.Drive }) {
    super()

    this.drive = drive
  }

  /**
   * Lists files and folders in a Google Drive folder.
   */
  @aiFunction({
    name: 'google_drive_list_files',
    description: 'Lists files and folders in a Google Drive folder.',
    inputSchema: googleDrive.ListFilesParamsSchema
  })
  async listFiles(
    args: {
      folderId?: string
      query?: string
    } & google.drive_v3.Params$Resource$Files$Get
  ): Promise<googleDrive.ListFilesResponse> {
    const { folderId, query, ...opts } = args
    // Build the query conditions
    const conditions = ['trashed = false'] // Always exclude trashed files

    if (folderId) {
      conditions.push(`'${folderId}' in parents`)
    }

    if (query) {
      conditions.push(`name contains '${query}'`)
    }

    // Combine all conditions with AND
    const q = conditions.join(' and ')

    const { data } = await this.drive.files.list({
      fields: googleDrive.requestFileFields,
      ...opts,
      q
    })
    const files = (data.files ?? []).map((file) =>
      pick(file, ...googleDrive.fileFields)
    )

    return pruneNullOrUndefinedDeep({
      files,
      nextPageToken: data.nextPageToken
    }) as any
  }

  /**
   * Gets a file's metadata from Google Drive.
   */
  @aiFunction({
    name: 'google_drive_get_file',
    description: "Gets a file's metadata from Google Drive.",
    inputSchema: z.object({ fileId: z.string() })
  })
  async getFile(
    opts: google.drive_v3.Params$Resource$Files$Get
  ): Promise<googleDrive.File> {
    const { data } = await this.drive.files.get({
      fields: googleDrive.requestFileFields,
      ...opts
    })

    return pruneNullOrUndefinedDeep(
      pick(data, ...googleDrive.fileFields)
    ) as any
  }

  /**
   * Exports a file from Google Drive.
   */
  @aiFunction({
    name: 'google_drive_export_file',
    description: 'Exports a file from Google Drive to a given mime-type.',
    inputSchema: z.object({
      fileId: z.string().describe('The ID of the file to export.'),
      mimeType: z
        .string()
        .describe('The MIME type of the format requested for this export.')
    })
  })
  async exportFile(
    opts: google.drive_v3.Params$Resource$Files$Export
  ): Promise<unknown> {
    return this.drive.files.export(opts)
  }
}
