import { assert } from '@agentic/platform-core'
import { createRoute, type OpenAPIHono, z } from '@hono/zod-openapi'

import type { AuthenticatedHonoEnv } from '@/lib/types'
import { db, eq, projectIdentifierSchema, schema } from '@/db'
import { acl } from '@/lib/acl'
import {
  openapiAuthenticatedSecuritySchemas,
  openapiErrorResponse404,
  openapiErrorResponses
} from '@/lib/openapi-utils'
import {
  getStorageObjectPublicUrl,
  getStorageSignedUploadUrl
} from '@/lib/storage'

export const getSignedUploadUrlQuerySchema = z.object({
  projectIdentifier: projectIdentifierSchema,

  /**
   * Should be a hash of the contents of the file to upload with the correct
   * file extension.
   *
   * @example `9f86d081884c7d659a2feaa0c55ad015a.png`
   */
  key: z
    .string()
    .nonempty()
    .describe(
      'Should be a hash of the contents of the file to upload with the correct file extension (eg, "9f86d081884c7d659a2feaa0c55ad015a.png").'
    )
})

const route = createRoute({
  description:
    "Gets a signed URL for uploading a file to Agentic's blob storage. Files are namespaced to a given project and are identified by a key that should be a hash of the file's contents, with the correct file extension.",
  tags: ['storage'],
  operationId: 'getSignedStorageUploadUrl',
  method: 'get',
  path: 'storage/signed-upload-url',
  security: openapiAuthenticatedSecuritySchemas,
  request: {
    query: getSignedUploadUrlQuerySchema
  },
  responses: {
    200: {
      description: 'A signed upload URL',
      content: {
        'application/json': {
          schema: z.object({
            signedUploadUrl: z
              .string()
              .url()
              .describe('The signed upload URL.'),
            publicObjectUrl: z
              .string()
              .url()
              .describe('The public URL the object will have once uploaded.')
          })
        }
      }
    },
    ...openapiErrorResponses,
    ...openapiErrorResponse404
  }
})

export function registerV1GetSignedStorageUploadUrl(
  app: OpenAPIHono<AuthenticatedHonoEnv>
) {
  return app.openapi(route, async (c) => {
    const { projectIdentifier, key } = c.req.valid('query')

    const project = await db.query.projects.findFirst({
      where: eq(schema.projects.identifier, projectIdentifier)
    })
    assert(project, 404, `Project not found "${projectIdentifier}"`)
    await acl(c, project, { label: 'Project' })

    const compoundKey = `${project.identifier}/${key}`
    const signedUploadUrl = await getStorageSignedUploadUrl(compoundKey)
    const publicObjectUrl = getStorageObjectPublicUrl(compoundKey)

    return c.json({ signedUploadUrl, publicObjectUrl })
  })
}
