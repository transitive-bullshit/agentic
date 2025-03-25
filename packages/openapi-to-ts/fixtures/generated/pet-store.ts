/**
 * This file was auto-generated from an OpenAPI spec.
 */

import { z } from 'zod'

export namespace petstore {
  export const apiBaseUrl = 'http://petstore.swagger.io/v1'

  // -----------------------------------------------------------------------------
  // Component schemas
  // -----------------------------------------------------------------------------

  export const PetSchema = z.object({
    id: z.number().int(),
    name: z.string(),
    tag: z.string().optional()
  })
  export type Pet = z.infer<typeof PetSchema>

  export const PetsSchema = z.array(PetSchema).max(100)
  export type Pets = z.infer<typeof PetsSchema>

  // -----------------------------------------------------------------------------
  // Operation schemas
  // -----------------------------------------------------------------------------

  export const ListPetsParamsSchema = z.object({
    /** How many items to return at one time (max 100) */
    limit: z
      .number()
      .int()
      .lte(100)
      .describe('How many items to return at one time (max 100)')
      .optional()
  })
  export type ListPetsParams = z.infer<typeof ListPetsParamsSchema>

  export const ListPetsResponseSchema = PetsSchema
  export type ListPetsResponse = z.infer<typeof ListPetsResponseSchema>

  export const CreatePetsParamsSchema = PetSchema
  export type CreatePetsParams = z.infer<typeof CreatePetsParamsSchema>

  export type CreatePetsResponse = undefined

  export const ShowPetByIdParamsSchema = z.object({
    /** The id of the pet to retrieve */
    petId: z.string().describe('The id of the pet to retrieve')
  })
  export type ShowPetByIdParams = z.infer<typeof ShowPetByIdParamsSchema>

  export const ShowPetByIdResponseSchema = PetSchema
  export type ShowPetByIdResponse = z.infer<typeof ShowPetByIdResponseSchema>
}
