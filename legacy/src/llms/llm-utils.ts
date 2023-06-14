import { zodToJsonSchema } from 'zod-to-json-schema'

import * as types from '@/types'
import { BaseTask } from '@/task'
import { isValidTaskIdentifier } from '@/utils'

export function getChatMessageFunctionDefinitionFromTask(
  task: BaseTask<any, any>
): types.openai.ChatMessageFunction {
  const name = task.nameForModel
  if (!isValidTaskIdentifier(name)) {
    throw new Error(`Invalid task name "${name}"`)
  }

  const jsonSchema = zodToJsonSchema(task.inputSchema, {
    name,
    $refStrategy: 'none'
  })

  const parameters: any = jsonSchema.definitions?.[name]
  if (parameters) {
    if (parameters.additionalProperties === false) {
      delete parameters['additionalProperties']
    }
  }

  return {
    name,
    description: task.descForModel || task.nameForHuman,
    parameters
  }
}

export function getChatMessageFunctionDefinitionsFromTasks(
  tasks: BaseTask<any, any>[]
): types.openai.ChatMessageFunction[] {
  return tasks.map(getChatMessageFunctionDefinitionFromTask)
}
