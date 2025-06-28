/**
 * This file was auto-generated from an OpenAPI spec.
 */

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
