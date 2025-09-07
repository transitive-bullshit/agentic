import { sha256 } from '@agentic/platform-core'
import {
  DeleteObjectCommand,
  type DeleteObjectCommandInput,
  GetObjectCommand,
  type GetObjectCommandInput,
  PutObjectCommand,
  type PutObjectCommandInput,
  S3Client
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { fileTypeFromBuffer } from 'file-type'
import ky from 'ky'
import { lookup as lookupMimeType } from 'mrmime'

import { env } from './env'

// This storage client is designed to work with any S3-compatible storage provider.
// For Cloudflare R2, see https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/

const STORAGE_DOMAIN = 'storage.agentic.so'
const Bucket = env.S3_BUCKET

export const storageClient = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_ACCESS_KEY_SECRET
  },
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED'
})

// This ensures that buckets are created automatically if they don't exist on
// Cloudflare R2. It won't affect other providers.
// @see https://developers.cloudflare.com/r2/examples/aws/custom-header/
storageClient.middlewareStack.add(
  (next, _) => async (args) => {
    const r = args.request as RequestInit
    r.headers = {
      'cf-create-bucket-if-missing': 'true',
      ...r.headers
    }

    return next(args)
  },
  { step: 'build', name: 'customHeaders' }
)

export async function getStorageObject(
  key: string,
  opts?: Omit<GetObjectCommandInput, 'Bucket' | 'Key'>
) {
  return storageClient.send(new GetObjectCommand({ Bucket, Key: key, ...opts }))
}

export async function putStorageObject(
  key: string,
  value: PutObjectCommandInput['Body'],
  opts?: Omit<PutObjectCommandInput, 'Bucket' | 'Key' | 'Body'>
) {
  return storageClient.send(
    new PutObjectCommand({ Bucket, Key: key, Body: value, ...opts })
  )
}

export async function deleteStorageObject(
  key: string,
  opts?: Omit<DeleteObjectCommandInput, 'Bucket' | 'Key'>
) {
  return storageClient.send(
    new DeleteObjectCommand({ Bucket, Key: key, ...opts })
  )
}

export function getStorageObjectInternalUrl(key: string) {
  return `${env.S3_ENDPOINT}/${Bucket}/${key}`
}

export function getStorageObjectPublicUrl(key: string) {
  return `${env.AGENTIC_STORAGE_BASE_URL}/${key}`
}

// TODO: Signed uploads don't seem to be working; getting a signature mismatch
// error, and no idea why. Switched to using non-presigned URL uploads for now,
// but this will be necessary in the future, for instance, for the web client
// to upload files.
export async function getStorageSignedUploadUrl(
  key: string,
  {
    expiresIn = 5 * 60 * 1000 // 5 minutes
  }: {
    expiresIn?: number
  } = {}
) {
  return getSignedUrl(
    storageClient,
    new PutObjectCommand({ Bucket, Key: key }),
    { expiresIn }
  )
}

export async function uploadFileUrlToStorage(
  inputUrl: string,
  {
    prefix
  }: {
    prefix: string
  }
): Promise<string> {
  let source: URL

  try {
    source = new URL(inputUrl)
  } catch {
    // Not a URL
    throw new Error(`Invalid source file URL: ${inputUrl}`)
  }

  if (source.hostname === STORAGE_DOMAIN) {
    // The source is already a public URL hosted on Agentic's blob storage.
    return source.toString()
  }

  const sourceBuffer = await ky.get(source).arrayBuffer()

  const [hash, inferredFileType] = await Promise.all([
    sha256(sourceBuffer),
    fileTypeFromBuffer(sourceBuffer)
  ])

  const maybeSourceExt = source.pathname.split('.').at(-1)
  const maybeSourceExt2 = maybeSourceExt
    ? /^[a-z]+$/i.test(maybeSourceExt)
      ? maybeSourceExt
      : undefined
    : undefined
  const maybeSourceMime =
    source.protocol === 'data:'
      ? source.pathname.split(',')[0]?.split(';')[0]
      : undefined
  const sourceExt0 =
    maybeSourceExt2 ??
    (maybeSourceMime && maybeSourceMime !== 'application/octet-stream'
      ? maybeSourceMime.split('/')[1]?.split('+')[0]
      : undefined)
  const sourceExt = sourceExt0 === 'markdown' ? 'md' : sourceExt0

  const fileType =
    inferredFileType ??
    (sourceExt
      ? {
          ext: sourceExt,
          mime: lookupMimeType(sourceExt)
        }
      : undefined)

  const filename = fileType?.ext ? `${hash}.${fileType.ext}` : hash
  const key = `${prefix}/${filename}`

  const publicObjectUrl = getStorageObjectPublicUrl(key)

  // console.log('uploading to r2', {
  //   key,
  //   source,
  //   sourceExt,
  //   maybeSourceMime,
  //   maybeSourceExt,
  //   maybeSourceExt2,
  //   inputUrl,
  //   fileType,
  //   publicObjectUrl
  // })

  try {
    // Check if the object already exists.
    await ky.head(publicObjectUrl)
  } catch {
    const body = Buffer.from(sourceBuffer)

    // Object doesn't exist yet, so upload it.
    try {
      await putStorageObject(key, body, {
        ContentType: fileType?.mime ?? 'application/octet-stream'
      })
    } catch (err: any) {
      const error = await err.response.text()
      // eslint-disable-next-line no-console
      console.error('error uploading to r2', err.message, error)
      throw err
    }
  }

  return publicObjectUrl
}
