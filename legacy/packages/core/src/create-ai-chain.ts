import type { SetOptional } from 'type-fest'
import type { z } from 'zod'
import pMap from 'p-map'

import type * as types from './types'
import { AIFunctionSet } from './ai-function-set'
import { AbortError } from './errors'
import { Msg } from './message'
import { asSchema, augmentSystemMessageWithJsonSchema } from './schema'
import { getErrorMessage } from './utils'

export type AIChainParams<Result extends types.AIChainResult = string> = {
  /** Name of the chain */
  name: string

  /** Chat completions function */
  chatFn: types.ChatFn

  /** Description of the chain */
  description?: string

  /** Optional chat completion params */
  params?: types.Simplify<
    Partial<Omit<types.ChatParams, 'tools' | 'functions'>>
  >

  /** Optional tools */
  tools?: types.AIFunctionLike[]

  /** Optional response schema */
  schema?: z.ZodType<Result> | types.Schema<Result>

  /**
   * Whether or not the response schema should use OpenAI's structured output
   * generation.
   */
  strict?: boolean

  /** Max number of LLM calls to allow */
  maxCalls?: number

  /** Max number of retries to allow */
  maxRetries?: number

  /** Max concurrency when invoking tool calls */
  toolCallConcurrency?: number

  /** Whether or not to inject the schema into the context */
  injectSchemaIntoSystemMessage?: boolean
}

/**
 * Creates a chain of chat completion calls that can be invoked as a single
 * function. It is meant to simplify the process of resolving tool calls
 * and optionally adding validation to the final result.
 *
 * The returned function will invoke the `chatFn` up to `maxCalls` times,
 * resolving any tool calls to the included `functions` and retrying if
 * necessary up to `maxRetries`.
 *
 * The chain ends when a non-tool call is returned, and the final result can
 * optionally be validated against a Zod schema, which defaults to a `string`.
 *
 * To prevent possible infinite loops, the chain will throw an error if it
 * exceeds `maxCalls` (`maxCalls` is expected to be >= `maxRetries`).
 */
export function createAIChain<Result extends types.AIChainResult = string>({
  name,
  description,
  chatFn,
  params,
  schema: rawSchema,
  tools,
  maxCalls = 5,
  maxRetries = 2,
  toolCallConcurrency = 8,
  injectSchemaIntoSystemMessage = false,
  strict = false
}: AIChainParams<Result>): types.AIChain<Result> {
  const functionSet = new AIFunctionSet(tools)
  const schema = rawSchema ? asSchema(rawSchema, { strict }) : undefined

  // TODO: support custom stopping criteria (like setting a flag in a tool call)

  const defaultParams: Partial<types.ChatParams> | undefined =
    schema && !functionSet.size
      ? {
          response_format: strict
            ? {
                type: 'json_schema',
                json_schema: {
                  name,
                  description,
                  strict,
                  schema: schema.jsonSchema
                }
              }
            : { type: 'json_object' }
        }
      : undefined

  return async (chatParams) => {
    const { messages, ...modelParams }: SetOptional<types.ChatParams, 'model'> =
      typeof chatParams === 'string'
        ? {
            ...defaultParams,
            ...params,
            messages: [...(params?.messages ?? []), Msg.user(chatParams)]
          }
        : {
            ...defaultParams,
            ...params,
            ...chatParams,
            messages: [
              ...(params?.messages ?? []),
              ...(chatParams?.messages ?? [])
            ]
          }

    if (!messages.length) {
      throw new Error('AIChain error: "messages" is empty')
    }

    if (schema && injectSchemaIntoSystemMessage) {
      const lastSystemMessageIndex = messages.findLastIndex(Msg.isSystem)
      const lastSystemMessageContent =
        messages[lastSystemMessageIndex]?.content!

      const systemMessage = augmentSystemMessageWithJsonSchema({
        system: lastSystemMessageContent,
        schema: schema.jsonSchema
      })

      if (lastSystemMessageIndex >= 0) {
        messages[lastSystemMessageIndex] = Msg.system(systemMessage!)
      } else {
        messages.unshift(Msg.system(systemMessage))
      }
    }

    let numCalls = 0
    let numErrors = 0

    do {
      ++numCalls

      const response = await chatFn({
        ...modelParams,
        messages,
        tools: functionSet.size ? functionSet.toolSpecs : undefined
      })

      const { message } = response
      messages.push(message)

      try {
        if (Msg.isToolCall(message)) {
          if (!functionSet.size) {
            throw new AbortError('No functions provided to handle tool call')
          }

          // Synchronously validate that all tool calls reference valid functions
          for (const toolCall of message.tool_calls) {
            const func = functionSet.get(toolCall.function.name)

            if (!func) {
              throw new Error(
                `No function found with name ${toolCall.function.name}`
              )
            }
          }

          await pMap(
            message.tool_calls,
            async (toolCall) => {
              const func = functionSet.get(toolCall.function.name)!

              // TODO: ideally we'd differentiate between tool argument validation
              // errors versus errors thrown from the tool implementation. Errors
              // from the underlying tool could be things like network errors, which
              // should be retried locally without re-calling the LLM.
              const result = await func(toolCall.function.arguments)

              const toolResult = Msg.toolResult(result, toolCall.id)
              messages.push(toolResult)
            },
            {
              concurrency: toolCallConcurrency
            }
          )
        } else if (Msg.isFuncCall(message)) {
          throw new AbortError(
            'Function calls are not supported; expected tool call'
          )
        } else if (Msg.isRefusal(message)) {
          throw new AbortError(`Model refusal: ${message.refusal}`)
        } else if (Msg.isAssistant(message)) {
          if (schema) {
            return schema.parse(message.content)
          } else {
            return message.content as Result
          }
        }
      } catch (err: any) {
        numErrors++

        if (err instanceof AbortError) {
          throw err
        }

        console.warn(`Chain "${name}" error:`, err.message)

        messages.push(
          Msg.user(
            `There was an error validating the response. Please check the error message and try again.\nError:\n${getErrorMessage(err)}`
          )
        )

        if (numErrors > maxRetries) {
          throw new Error(
            `Chain ${name} failed after ${numErrors} errors: ${err.message}`,
            {
              cause: err
            }
          )
        }
      }
    } while (numCalls < maxCalls)

    throw new Error(
      `Chain "${name}" aborted after reaching max ${maxCalls} calls`
    )
  }
}
