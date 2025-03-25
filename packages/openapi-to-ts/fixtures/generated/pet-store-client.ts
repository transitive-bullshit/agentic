/* eslint-disable unicorn/no-unreadable-iife */
/* eslint-disable unicorn/no-array-reduce */

/**
 * This file was auto-generated from an OpenAPI spec.
 */

import {
  aiFunction,
  AIFunctionsProvider,
  pick,
  sanitizeSearchParams
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
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

/**
 * Agentic PetStore client.
 */
export class PetStoreClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance

  protected readonly apiBaseUrl: string

  constructor({
    apiBaseUrl = petstore.apiBaseUrl,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: KyInstance
  } = {}) {
    super()

    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({
      prefixUrl: apiBaseUrl
    })
  }

  /**
   * List all pets.
   */
  @aiFunction({
    name: 'pet_store_list_pets',
    description: `List all pets.`,
    inputSchema: petstore.ListPetsParamsSchema
  })
  async listPets(
    params: petstore.ListPetsParams
  ): Promise<petstore.ListPetsResponse> {
    return this.ky
      .get('/pets', {
        searchParams: sanitizeSearchParams(params)
      })
      .json<petstore.ListPetsResponse>()
  }

  /**
   * Create a pet.
   */
  @aiFunction({
    name: 'pet_store_create_pets',
    description: `Create a pet.`,
    inputSchema: petstore.CreatePetsParamsSchema
  })
  async createPets(
    params: petstore.CreatePetsParams
  ): Promise<petstore.CreatePetsResponse> {
    return this.ky
      .post('/pets', {
        json: pick(params, 'id', 'name', 'tag')
      })
      .json<petstore.CreatePetsResponse>()
  }

  /**
   * Info for a specific pet.
   */
  @aiFunction({
    name: 'pet_store_show_pet_by_id',
    description: `Info for a specific pet.`,
    inputSchema: petstore.ShowPetByIdParamsSchema
  })
  async showPetById(
    params: petstore.ShowPetByIdParams
  ): Promise<petstore.ShowPetByIdResponse> {
    return this.ky
      .get(`/pets/${params.petId}`)
      .json<petstore.ShowPetByIdResponse>()
  }
}
