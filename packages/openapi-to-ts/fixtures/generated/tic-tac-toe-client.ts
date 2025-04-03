/**
 * This file was auto-generated from an OpenAPI spec.
 */

import { AIFunctionsProvider, aiFunction } from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import { tictactoe } from './tic-tac-toe'

/**
 * Agentic TicTacToe client.
 *
 * This API allows writing down marks on a Tic Tac Toe board
and requesting the state of the board or of individual squares.
.
 */
export class TicTacToeClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance

  protected readonly apiBaseUrl: string

  constructor({
    apiBaseUrl,
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
   * Retrieves the current state of the board and the winner.
   */
  @aiFunction({
    name: 'tic_tac_toe_get_board',
    description: `Retrieves the current state of the board and the winner.`,
    inputSchema: tictactoe.GetBoardParamsSchema,
    tags: ['Gameplay']
  })
  async getBoard(
    _params: tictactoe.GetBoardParams
  ): Promise<tictactoe.GetBoardResponse> {
    return this.ky.get('/board').json<tictactoe.GetBoardResponse>()
  }

  /**
   * Retrieves the requested square.
   */
  @aiFunction({
    name: 'tic_tac_toe_get_square',
    description: `Retrieves the requested square.`,
    inputSchema: tictactoe.GetSquareParamsSchema,
    tags: ['Gameplay']
  })
  async getSquare(
    _params: tictactoe.GetSquareParams
  ): Promise<tictactoe.GetSquareResponse> {
    return this.ky
      .get('/board/{row}/{column}')
      .json<tictactoe.GetSquareResponse>()
  }

  /**
   * Places a mark on the board and retrieves the whole board and the winner (if any).
   */
  @aiFunction({
    name: 'tic_tac_toe_put_square',
    description: `Places a mark on the board and retrieves the whole board and the winner (if any).`,
    inputSchema: tictactoe.PutSquareParamsSchema,
    tags: ['Gameplay']
  })
  async putSquare(
    _params: tictactoe.PutSquareParams
  ): Promise<tictactoe.PutSquareResponse> {
    return this.ky
      .put('/board/{row}/{column}')
      .json<tictactoe.PutSquareResponse>()
  }
}
