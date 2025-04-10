import type * as google from 'googleapis'
import type { SetNonNullable, Simplify } from 'type-fest'
import {
  aiFunction,
  AIFunctionsProvider,
  pick,
  pruneNullOrUndefined,
  pruneNullOrUndefinedDeep
} from '@agentic/core'
import { z } from 'zod'

export namespace googleDrive {
  export type File = Simplify<
    SetNonNullable<
      Pick<
        google.drive_v3.Schema$File,
        | 'id'
        | 'name'
        | 'mimeType'
        | 'webViewLink'
        | 'webContentLink'
        | 'size'
        | 'createdTime'
        | 'modifiedTime'
        | 'parents'
      >
    >
  >

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
 * Simplified Google Drive API client.
 *
 * @see https://developers.google.com/workspace/drive/api
 *
 * @example
 * ```ts
 * import { GoogleDriveClient } from '@agentic/google-drive'
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
    const files = (data.files ?? []).map(convertFile)

    return pruneNullOrUndefined({
      files,
      nextPageToken: data.nextPageToken
    })
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

    return convertFile(data)
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

  @aiFunction({
    name: 'google_drive_create_folder',
    description: 'Creates a new folder in Google Drive.',
    inputSchema: z.object({
      name: z.string().describe('The name of the folder to create.'),
      parentId: z.string().describe('The ID of the parent folder.').optional()
    })
  })
  async createFolder(
    opts: Omit<
      google.drive_v3.Params$Resource$Files$Create,
      'media' | 'requestBody'
    > & {
      name: string
      parentId?: string
    }
  ): Promise<googleDrive.File> {
    const { data } = await this.drive.files.create({
      requestBody: {
        mimeType: 'application/vnd.google-apps.folder',
        name: opts.name,
        parents: opts.parentId ? [opts.parentId] : undefined
      },
      fields: googleDrive.requestFileFields,
      ...opts
    })

    return convertFile(data)
  }
}

function convertFile(data: google.drive_v3.Schema$File): googleDrive.File {
  return pruneNullOrUndefinedDeep(
    pick(data, ...googleDrive.fileFields)
  ) as googleDrive.File
}
