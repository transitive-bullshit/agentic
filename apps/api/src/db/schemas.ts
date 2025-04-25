import { validators } from '@agentic/validators'
import { z } from '@hono/zod-openapi'

function getCuidSchema(idLabel: string) {
  return z.string().refine((id) => validators.cuid(id), {
    message: `Invalid ${idLabel}`
  })
}

export const cuidSchema = getCuidSchema('id')
export const userIdSchema = getCuidSchema('user id')

export const projectIdSchema = z
  .string()
  .refine((id) => validators.project(id), {
    message: 'Invalid project id'
  })

export const deploymentIdSchema = z
  .string()
  .refine((id) => validators.deployment(id), {
    message: 'Invalid deployment id'
  })
