// import { isValidNamespace } from '@agentic/platform-validators'
import { z } from '@hono/zod-openapi'

import {
  paginationSchema,
  projectIdentifierSchema,
  projectIdSchema,
  projectRelationsSchema
} from '@/db'

export const projectIdParamsSchema = z.object({
  projectId: projectIdSchema.openapi({
    param: {
      description: 'Project ID',
      name: 'projectId',
      in: 'path'
    }
  })
})

// export const namespaceParamsSchema = z.object({
//   namespace: z
//     .string()
//     .refine((namespace) => isValidNamespace(namespace), {
//       message: 'Invalid namespace'
//     })
//     .openapi({
//       param: {
//         description: 'Namespace',
//         name: 'namespace',
//         in: 'path'
//       }
//     })
// })

export const projectIdentifierQuerySchema = z.object({
  projectIdentifier: projectIdentifierSchema
})

export const filterPublicProjectSchema = z.object({
  tag: z.string().optional(),
  notTag: z.string().optional()
})

export const populateProjectSchema = z.object({
  populate: z
    .union([projectRelationsSchema, z.array(projectRelationsSchema)])
    .default([])
    .transform((p) => (Array.isArray(p) ? p : [p]))
    .optional()
})

export const projectIdentifierAndPopulateSchema = z.object({
  ...populateProjectSchema.shape,
  ...projectIdentifierQuerySchema.shape
})

export const paginationAndPopulateProjectSchema = z.object({
  ...paginationSchema.shape,
  ...populateProjectSchema.shape
})

export const listPublicProjectsQuerySchema = z.object({
  ...paginationSchema.shape,
  ...populateProjectSchema.shape,
  ...filterPublicProjectSchema.shape
})
