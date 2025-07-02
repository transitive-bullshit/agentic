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

import { env } from './env'

// This storage client is designed to work with any S3-compatible storage provider.
// For Cloudflare R2, see https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/

const Bucket = env.S3_BUCKET

export const storageClient = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_ACCESS_KEY_SECRET
  }
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
  return `${env.AGENTIC_STORAGE_BASE_URL}/${Bucket}/${key}`
}

export function getStorageObjectPublicUrl(key: string) {
  return `${env.AGENTIC_STORAGE_BASE_URL}/${key}`
}

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

export async function uploadFileToStorage(
  input: string,
  {
    projectIdentifier
  }: {
    projectIdentifier: string
  }
): Promise<string> {
  let source: URL

  try {
    source = new URL(input)
  } catch {
    // Not a URL
    throw new Error(`Invalid source file URL: ${input}`)
  }

  if (source.hostname === 'storage.agentic.so') {
    // The source is already a public URL hosted on Agentic's blob storage.
    return source.toString()
  }

  const sourceBuffer = await ky.get(source).arrayBuffer()

  const [hash, fileType] = await Promise.all([
    sha256(sourceBuffer),
    fileTypeFromBuffer(sourceBuffer)
  ])

  const filename = fileType ? `${hash}.${fileType.ext}` : hash
  const key = `${projectIdentifier}/${filename}`

  const publicObjectUrl = getStorageObjectPublicUrl(key)

  try {
    // Check if the object already exists.
    await ky.head(publicObjectUrl)
  } catch {
    const signedUploadUrl = await getStorageSignedUploadUrl(key)

    // Object doesn't exist yet, so upload it.
    await ky.post(signedUploadUrl, {
      body: sourceBuffer,
      headers: {
        'Content-Type': fileType?.mime ?? 'application/octet-stream'
      }
    })
  }

  return publicObjectUrl
}
