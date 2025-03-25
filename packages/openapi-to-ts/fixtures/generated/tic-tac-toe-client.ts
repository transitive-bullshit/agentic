/* eslint-disable unicorn/no-unreadable-iife */
/* eslint-disable unicorn/no-array-reduce */

/**
 * This file was auto-generated from an OpenAPI spec.
 */

import { aiFunction,AIFunctionsProvider } from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import { z } from 'zod'

export namespace tictactoe {
  // -----------------------------------------------------------------------------
  // Component schemas
  // -----------------------------------------------------------------------------

  /** Winner of the game. `.` means nobody has won yet. */
  export const WinnerSchema = z
    .enum(['.', 'X', 'O'])
    .describe('Winner of the game. `.` means nobody has won yet.')
  export type Winner = z.infer<typeof WinnerSchema>

  /** Possible values for a board square. `.` means empty square. */
  export const MarkSchema = z
    .enum(['.', 'X', 'O'])
    .describe('Possible values for a board square. `.` means empty square.')
  export type Mark = z.infer<typeof MarkSchema>

  export const BoardSchema = z
    .array(z.array(MarkSchema).min(3).max(3))
    .min(3)
    .max(3)
  export type Board = z.infer<typeof BoardSchema>

  export const StatusSchema = z.object({
    winner: WinnerSchema.optional(),
    board: BoardSchema.optional()
  })
  export type Status = z.infer<typeof StatusSchema>

  // -----------------------------------------------------------------------------
  // Operation schemas
  // -----------------------------------------------------------------------------

  export const GetBoardParamsSchema = z.object({})
  export type GetBoardParams = z.infer<typeof GetBoardParamsSchema>

  export const GetBoardResponseSchema = StatusSchema
  export type GetBoardResponse = z.infer<typeof GetBoardResponseSchema>

  export const GetSquareParamsSchema = z.object({})
  export type GetSquareParams = z.infer<typeof GetSquareParamsSchema>

  export const GetSquareResponseSchema = MarkSchema
  export type GetSquareResponse = z.infer<typeof GetSquareResponseSchema>

  export const PutSquareParamsSchema = MarkSchema
  export type PutSquareParams = z.infer<typeof PutSquareParamsSchema>

  export const PutSquareResponseSchema = StatusSchema
  export type PutSquareResponse = z.infer<typeof PutSquareResponseSchema>
}

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
    inputSchema: tictactoe.GetBoardParamsSchema
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
    inputSchema: tictactoe.GetSquareParamsSchema
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
    inputSchema: tictactoe.PutSquareParamsSchema
  })
  async putSquare(
    _params: tictactoe.PutSquareParams
  ): Promise<tictactoe.PutSquareResponse> {
    return this.ky
      .put('/board/{row}/{column}')
      .json<tictactoe.PutSquareResponse>()
  }
}
