/**
 * This file was auto-generated from an OpenAPI spec.
 */

import { z } from 'zod'

export namespace petstoreexpanded {
  export const apiBaseUrl = 'http://petstore.swagger.io/api'

  // -----------------------------------------------------------------------------
  // Component schemas
  // -----------------------------------------------------------------------------

  export const NewPetSchema = z.object({
    name: z.string(),
    tag: z.string().optional()
  })
  export type NewPet = z.infer<typeof NewPetSchema>

  export const PetSchema = z.intersection(
    NewPetSchema,
    z.object({ id: z.number().int() })
  )
  export type Pet = z.infer<typeof PetSchema>

  // -----------------------------------------------------------------------------
  // Operation schemas
  // -----------------------------------------------------------------------------

  export const FindPetsParamsSchema = z.object({
    /** tags to filter by */
    tags: z.array(z.string()).describe('tags to filter by').optional(),
    /** maximum number of results to return */
    limit: z
      .number()
      .int()
      .describe('maximum number of results to return')
      .optional()
  })
  export type FindPetsParams = z.infer<typeof FindPetsParamsSchema>

  export const FindPetsResponseSchema = z.array(PetSchema)
  export type FindPetsResponse = z.infer<typeof FindPetsResponseSchema>

  export const AddPetParamsSchema = NewPetSchema
  export type AddPetParams = z.infer<typeof AddPetParamsSchema>

  export const AddPetResponseSchema = PetSchema
  export type AddPetResponse = z.infer<typeof AddPetResponseSchema>

  export const FindPetByIdParamsSchema = z.object({
    /** ID of pet to fetch */
    id: z.number().int().describe('ID of pet to fetch')
  })
  export type FindPetByIdParams = z.infer<typeof FindPetByIdParamsSchema>

  export const FindPetByIdResponseSchema = PetSchema
  export type FindPetByIdResponse = z.infer<typeof FindPetByIdResponseSchema>

  export const DeletePetParamsSchema = z.object({
    /** ID of pet to delete */
    id: z.number().int().describe('ID of pet to delete')
  })
  export type DeletePetParams = z.infer<typeof DeletePetParamsSchema>

  export type DeletePetResponse = undefined
}
