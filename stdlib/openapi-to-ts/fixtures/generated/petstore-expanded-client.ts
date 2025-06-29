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

import { petstoreexpanded } from './petstore-expanded'

/**
 * Agentic PetstoreExpanded client.
 *
 * A sample API that uses a petstore as an example to demonstrate features in the OpenAPI 3.0 specification.
 */
export class PetstoreExpandedClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance

  protected readonly apiBaseUrl: string

  constructor({
    apiBaseUrl = petstoreexpanded.apiBaseUrl,
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
 * Returns all pets from the system that the user has access to
Nam sed condimentum est. Maecenas tempor sagittis sapien, nec rhoncus sem sagittis sit amet. Aenean at gravida augue, ac iaculis sem. Curabitur odio lorem, ornare eget elementum nec, cursus id lectus. Duis mi turpis, pulvinar ac eros ac, tincidunt varius justo. In hac habitasse platea dictumst. Integer at adipiscing ante, a sagittis ligula. Aenean pharetra tempor ante molestie imperdiet. Vivamus id aliquam diam. Cras quis velit non tortor eleifend sagittis. Praesent at enim pharetra urna volutpat venenatis eget eget mauris. In eleifend fermentum facilisis. Praesent enim enim, gravida ac sodales sed, placerat id erat. Suspendisse lacus dolor, consectetur non augue vel, vehicula interdum libero. Morbi euismod sagittis libero sed lacinia.

Sed tempus felis lobortis leo pulvinar rutrum. Nam mattis velit nisl, eu condimentum ligula luctus nec. Phasellus semper velit eget aliquet faucibus. In a mattis elit. Phasellus vel urna viverra, condimentum lorem id, rhoncus nibh. Ut pellentesque posuere elementum. Sed a varius odio. Morbi rhoncus ligula libero, vel eleifend nunc tristique vitae. Fusce et sem dui. Aenean nec scelerisque tortor. Fusce malesuada accumsan magna vel tempus. Quisque mollis felis eu dolor tristique, sit amet auctor felis gravida. Sed libero lorem, molestie sed nisl in, accumsan tempor nisi. Fusce sollicitudin massa ut lacinia mattis. Sed vel eleifend lorem. Pellentesque vitae felis pretium, pulvinar elit eu, euismod sapien.
 */
  @aiFunction({
    name: 'petstore_expanded_find_pets',
    description: `Returns all pets from the system that the user has access to
Nam sed condimentum est. Maecenas tempor sagittis sapien, nec rhoncus sem sagittis sit amet. Aenean at gravida augue, ac iaculis sem. Curabitur odio lorem, ornare eget elementum nec, cursus id lectus. Duis mi turpis, pulvinar ac eros ac, tincidunt varius justo. In hac habitasse platea dictumst. Integer at adipiscing ante, a sagittis ligula. Aenean pharetra tempor ante molestie imperdiet. Vivamus id aliquam diam. Cras quis velit non tortor eleifend sagittis. Praesent at enim pharetra urna volutpat venenatis eget eget mauris. In eleifend fermentum facilisis. Praesent enim enim, gravida ac sodales sed, placerat id erat. Suspendisse lacus dolor, consectetur non augue vel, vehicula interdum libero. Morbi euismod sagittis libero sed lacinia.

Sed tempus felis lobortis leo pulvinar rutrum. Nam mattis velit nisl, eu condimentum ligula luctus nec. Phasellus semper velit eget aliquet faucibus. In a mattis elit. Phasellus vel urna viverra, condimentum lorem id, rhoncus nibh. Ut pellentesque posuere elementum. Sed a varius odio. Morbi rhoncus ligula libero, vel eleifend nunc tristique vitae. Fusce et sem dui. Aenean nec scelerisque tortor. Fusce malesuada accumsan magna vel tempus. Quisque mollis felis eu dolor tristique, sit amet auctor felis gravida. Sed libero lorem, molestie sed nisl in, accumsan tempor nisi. Fusce sollicitudin massa ut lacinia mattis. Sed vel eleifend lorem. Pellentesque vitae felis pretium, pulvinar elit eu, euismod sapien.`,
    inputSchema: petstoreexpanded.FindPetsParamsSchema
  })
  async findPets(
    params: petstoreexpanded.FindPetsParams
  ): Promise<petstoreexpanded.FindPetsResponse> {
    return this.ky
      .get('/pets', {
        searchParams: sanitizeSearchParams(pick(params, 'tags', 'limit'))
      })
      .json<petstoreexpanded.FindPetsResponse>()
  }

  /**
   * Creates a new pet in the store. Duplicates are allowed.
   */
  @aiFunction({
    name: 'petstore_expanded_add_pet',
    description: `Creates a new pet in the store. Duplicates are allowed.`,
    inputSchema: petstoreexpanded.AddPetParamsSchema
  })
  async addPet(
    params: petstoreexpanded.AddPetParams
  ): Promise<petstoreexpanded.AddPetResponse> {
    return this.ky
      .post('/pets', {
        json: pick(params, 'name', 'tag')
      })
      .json<petstoreexpanded.AddPetResponse>()
  }

  /**
   * Returns a user based on a single ID, if the user does not have access to the pet.
   */
  @aiFunction({
    name: 'petstore_expanded_find_pet_by_id',
    description: `Returns a user based on a single ID, if the user does not have access to the pet.`,
    inputSchema: petstoreexpanded.FindPetByIdParamsSchema
  })
  async findPetById(
    params: petstoreexpanded.FindPetByIdParams
  ): Promise<petstoreexpanded.FindPetByIdResponse> {
    return this.ky
      .get(`/pets/${params.id}`)
      .json<petstoreexpanded.FindPetByIdResponse>()
  }

  /**
   * deletes a single pet based on the ID supplied.
   */
  @aiFunction({
    name: 'petstore_expanded_delete_pet',
    description: `deletes a single pet based on the ID supplied.`,
    inputSchema: petstoreexpanded.DeletePetParamsSchema
  })
  async deletePet(
    params: petstoreexpanded.DeletePetParams
  ): Promise<petstoreexpanded.DeletePetResponse> {
    return this.ky
      .delete(`/pets/${params.id}`)
      .json<petstoreexpanded.DeletePetResponse>()
  }
}
