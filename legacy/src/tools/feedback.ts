import checkbox from '@inquirer/checkbox'
import editor from '@inquirer/editor'
import select from '@inquirer/select'
import { ZodTypeAny, z } from 'zod'

import * as types from '../types'
import { BaseTask } from '../task'

/**
 * Actions the user can take in the feedback selection prompt.
 */
export const UserActions = {
  Accept: 'accept',
  Edit: 'edit',
  Decline: 'decline',
  Select: 'select',
  Exit: 'exit'
} as const

export type UserActions = (typeof UserActions)[keyof typeof UserActions]

/**
 * Messages to display to the user for each action.
 */
const UserActionMessages: Record<UserActions, string> = {
  [UserActions.Accept]: 'Accept inputs',
  [UserActions.Edit]: 'Edit (open in editor)',
  [UserActions.Decline]: 'Decline',
  [UserActions.Select]: 'Select inputs to keep',
  [UserActions.Exit]: 'Exit'
}

/**
 * Prompt the user to select one of a list of options.
 */
async function askUser(
  message: string,
  choices: UserActions[]
): Promise<UserActions> {
  return select({
    message,
    choices: choices.map((choice) => ({
      name: UserActionMessages[choice],
      value: choice
    }))
  })
}

/**
 * Output schema when prompting the user to accept, edit, or decline a single input.
 */
export const FeedbackSingleOutputSchema = <T extends ZodTypeAny>(result: T) =>
  z.object({
    result: result,
    accepted: z.boolean()
  })

/**
 * Prompt the user to accept, edit, or decline a single input.
 */
export class HumanFeedbackSingle<T extends ZodTypeAny> extends BaseTask<
  ZodTypeAny,
  ZodTypeAny
> {
  protected choiceSchema: T

  constructor(choiceSchema: T) {
    super()
    this.choiceSchema = choiceSchema
  }

  public get inputSchema() {
    return this.choiceSchema
  }

  public get outputSchema() {
    return FeedbackSingleOutputSchema(this.choiceSchema)
  }

  protected actionHandlers = {
    [UserActions.Accept]: (
      input: types.ParsedData<typeof this.inputSchema>
    ) => ({ result: input, accepted: true }),
    [UserActions.Edit]: async (
      input: types.ParsedData<typeof this.inputSchema>
    ) => {
      const editedInput = await editor({
        message: 'Edit the input:',
        default: JSON.stringify(input)
      })
      return this.outputSchema.parse({
        result: JSON.parse(editedInput),
        accepted: true
      })
    },
    [UserActions.Decline]: () => ({ result: null, accepted: false }),
    [UserActions.Exit]: () => {
      throw new Error('Exiting...')
    }
  }

  /**
   * Prompts the user to give feedback for the given input and handles their response.
   */
  public async call(
    input: types.ParsedData<typeof this.inputSchema>
  ): Promise<types.ParsedData<typeof this.outputSchema>> {
    try {
      input = this.inputSchema.parse(input)
      const msg = [
        'The following input was generated:',
        JSON.stringify(input, null, 2),
        'What would you like to do?'
      ].join('\n')
      const feedback = await askUser(msg, [
        UserActions.Accept,
        UserActions.Edit,
        UserActions.Decline,
        UserActions.Exit
      ])
      const handler = this.actionHandlers[feedback]
      if (!handler) {
        throw new Error(`Unexpected feedback: ${feedback}`)
      }
      return handler(input)
    } catch (err) {
      console.error('Error parsing input:', err)
      throw err
    }
  }
}

/**
 * Output schema when prompting the user to accept, select from, edit, or decline a list of inputs.
 */
export const FeedbackSelectOutputSchema = <T extends ZodTypeAny>(result: T) =>
  z.object({
    results: z.array(result),
    accepted: z.boolean()
  })

/**
 * Prompt the user to accept, select from, edit, or decline a list of inputs.
 */
export class HumanFeedbackSelect<T extends ZodTypeAny> extends BaseTask<
  ZodTypeAny,
  ZodTypeAny
> {
  protected choiceSchema: T

  constructor(choiceSchema: T) {
    super()
    this.choiceSchema = choiceSchema
  }

  public get inputSchema() {
    return z.array(this.choiceSchema)
  }

  public get outputSchema() {
    return FeedbackSelectOutputSchema(this.choiceSchema)
  }

  protected actionHandlers = {
    [UserActions.Accept]: (
      input: types.ParsedData<typeof this.inputSchema>
    ) => ({ results: input, accepted: true }),
    [UserActions.Edit]: async (
      input: types.ParsedData<typeof this.inputSchema>
    ) => {
      const editedInput = await editor({
        message: 'Edit the input:',
        default: JSON.stringify(input, null, 2)
      })
      return this.outputSchema.parse({
        results: JSON.parse(editedInput),
        accepted: true
      })
    },
    [UserActions.Select]: async (
      input: types.ParsedData<typeof this.inputSchema>
    ) => {
      const choices = input.map((completion) => ({
        name: completion,
        value: completion
      }))
      const chosen = await checkbox({
        message: 'Pick items to keep:',
        choices,
        pageSize: choices.length
      })
      return { results: chosen.length === 0 ? [] : chosen, accepted: true }
    },
    [UserActions.Decline]: () => ({ results: [], accepted: false }),
    [UserActions.Exit]: () => {
      throw new Error('Exiting...')
    }
  }

  /**
   * Prompts the user to give feedback for the given list of inputs and handles their response.
   */
  public async call(
    input: types.ParsedData<typeof this.inputSchema>
  ): Promise<types.ParsedData<typeof this.outputSchema>> {
    try {
      input = this.inputSchema.parse(input)
      const message = [
        'The following inputs were generated:',
        ...input.map(
          (choice, index) => `${index + 1}. ${JSON.stringify(choice, null, 2)}`
        ),
        'What would you like to do?'
      ].join('\n')
      const feedback = await askUser(message, [
        UserActions.Accept,
        UserActions.Select,
        UserActions.Edit,
        UserActions.Decline,
        UserActions.Exit
      ])
      const handler = this.actionHandlers[feedback]
      if (!handler) {
        throw new Error(`Unexpected feedback: ${feedback}`)
      }
      return handler(input)
    } catch (err) {
      console.error('Error parsing input:', err)
      throw err
    }
  }
}
