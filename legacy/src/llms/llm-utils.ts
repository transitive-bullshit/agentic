import pMap from 'p-map'
import { ZodTypeAny } from 'zod'
import { zodToJsonSchema as zodToJsonSchemaImpl } from 'zod-to-json-schema'

import * as types from '@/types'
import { BaseTask } from '@/task'
import { getModelNameForTiktoken } from '@/tokenizer'
import { isValidTaskIdentifier } from '@/utils'

// TODO: this needs work + testing
// TODO: move to isolated module
// TODO compare with https://gist.github.com/rileytomasek/4811b5fdd9c82c4730c191317ea76411
export async function getNumTokensForChatMessages({
  messages,
  model,
  getNumTokens,
  concurrency = 8
}: {
  messages: types.ChatMessage[]
  model: string
  getNumTokens: (text: string) => Promise<number>
  concurrency?: number
}): Promise<{
  numTokensTotal: number
  numTokensPerMessage: number[]
}> {
  let numTokensTotal = 0
  let configNumTokensPerMessage = 0
  let configNumTokensPerName = 0

  const modelName = getModelNameForTiktoken(model)

  // https://github.com/openai/openai-cookbook/blob/main/examples/How_to_format_inputs_to_ChatGPT_models.ipynb
  if (modelName === 'gpt-3.5-turbo') {
    configNumTokensPerMessage = 4
    configNumTokensPerName = -1
  } else if (modelName.startsWith('gpt-4')) {
    configNumTokensPerMessage = 3
    configNumTokensPerName = 1
  } else {
    // TODO
    configNumTokensPerMessage = 4
    configNumTokensPerName = -1
  }

  const numTokensPerMessage = await pMap(
    messages,
    async (message) => {
      let content = message.content || ''
      if (message.function_call) {
        // TODO: this case needs testing
        content = message.function_call.arguments || ''
      }

      const [numTokensContent, numTokensRole, numTokensName] =
        await Promise.all([
          getNumTokens(content),
          getNumTokens(message.role),
          message.name
            ? getNumTokens(message.name).then((n) => n + configNumTokensPerName)
            : Promise.resolve(0)
        ])

      const numTokens =
        configNumTokensPerMessage +
        numTokensContent +
        numTokensRole +
        numTokensName

      numTokensTotal += numTokens
      return numTokens
    },
    {
      concurrency
    }
  )

  // TODO
  numTokensTotal += 3 // every reply is primed with <|start|>assistant<|message|>

  return { numTokensTotal, numTokensPerMessage }
}

export function zodToJsonSchema({
  zodSchema,
  name
}: {
  zodSchema: ZodTypeAny
  name: string
}): any {
  const jsonSchema = zodToJsonSchemaImpl(zodSchema, {
    name,
    $refStrategy: 'none'
  })

  const parameters: any = jsonSchema.definitions?.[name]
  if (parameters) {
    if (parameters.additionalProperties === false) {
      delete parameters['additionalProperties']
    }
  }

  return parameters
}

export function getChatMessageFunctionDefinitionFromTask(
  task: BaseTask<any, any>
): types.openai.ChatMessageFunction {
  const name = task.nameForModel
  if (!isValidTaskIdentifier(name)) {
    throw new Error(`Invalid task name "${name}"`)
  }

  const parameters = zodToJsonSchema({ zodSchema: task.inputSchema, name })

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
