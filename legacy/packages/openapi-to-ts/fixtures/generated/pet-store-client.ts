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

import { petstore } from './pet-store'

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
    inputSchema: petstore.ListPetsParamsSchema,
    tags: ['pets']
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
    inputSchema: petstore.CreatePetsParamsSchema,
    tags: ['pets']
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
    inputSchema: petstore.ShowPetByIdParamsSchema,
    tags: ['pets']
  })
  async showPetById(
    params: petstore.ShowPetByIdParams
  ): Promise<petstore.ShowPetByIdResponse> {
    return this.ky
      .get(`/pets/${params.petId}`)
      .json<petstore.ShowPetByIdResponse>()
  }
}
