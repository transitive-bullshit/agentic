import { JSONRepairError, jsonrepair } from 'jsonrepair'
import { dedent } from 'ts-dedent'
import { type SetRequired } from 'type-fest'
import { ZodType, z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

import * as errors from '@/errors'
import * as types from '@/types'
import { parseOutput } from '@/llms/parse-output'
import { BaseTask } from '@/task'
import { getCompiledTemplate } from '@/template'
import {
  extractFunctionIdentifierFromString,
  isFunction,
  stringifyForModel
} from '@/utils'

import { BaseLLM } from './llm'
import {
  getChatMessageFunctionDefinitionsFromTasks,
  getNumTokensForChatMessages
} from './llm-utils'

export abstract class BaseChatCompletion<
  TInput extends types.TaskInput = void,
  TOutput extends types.TaskOutput = string,
  TModelParams extends Record<string, any> = Record<string, any>,
  TChatCompletionResponse extends Record<string, any> = Record<string, any>
> extends BaseLLM<TInput, TOutput, TModelParams> {
  protected _messages: types.ChatMessageInput<TInput>[]
  protected _tools?: BaseTask<any, any>[]

  constructor(
    options: SetRequired<
      types.ChatModelOptions<TInput, TOutput, TModelParams>,
      'provider' | 'model' | 'messages'
    >
  ) {
    super(options)

    this._messages = options.messages
    this._tools = options.tools
  }

  // TODO: use polymorphic `this` type to return correct BaseLLM subclass type
  input<U extends types.TaskInput>(
    inputSchema: ZodType<U>
  ): BaseChatCompletion<U, TOutput, TModelParams> {
    const refinedInstance = this as unknown as BaseChatCompletion<
      U,
      TOutput,
      TModelParams
    >
    refinedInstance._inputSchema = inputSchema
    return refinedInstance
  }

  // TODO: use polymorphic `this` type to return correct BaseLLM subclass type
  output<U extends types.TaskOutput>(
    outputSchema: ZodType<U>
  ): BaseChatCompletion<TInput, U, TModelParams> {
    const refinedInstance = this as unknown as BaseChatCompletion<
      TInput,
      U,
      TModelParams
    >
    refinedInstance._outputSchema = outputSchema
    return refinedInstance
  }

  public tools(tools: BaseTask<any, any>[]): this {
    if (!this.supportsTools) {
      throw new Error(`This LLM "${this.nameForHuman}" does not support tools`)
    }

    this._tools = tools
    for (const tool of tools) {
      tool.agentic = this.agentic
    }

    return this
  }

  /**
   * Whether or not this chat completion model directly supports the use of tools.
   */
  public get supportsTools(): boolean {
    return false
  }

  public override validate() {
    super.validate()

    if (this._tools) {
      for (const tool of this._tools) {
        if (!tool.agentic) {
          tool.agentic = this.agentic
        } else if (tool.agentic !== this.agentic) {
          throw new Error(
            `Task "${this.nameForHuman}" has a different Agentic runtime instance than the tool "${tool.nameForHuman}"`
          )
        }

        tool.validate()
      }
    }
  }

  protected abstract _createChatCompletion(
    messages: types.ChatMessage[],
    functions?: types.openai.ChatMessageFunction[]
  ): Promise<types.BaseChatCompletionResponse<TChatCompletionResponse>>

  public async buildMessages(
    input?: TInput,
    ctx?: types.TaskCallContext<TInput>
  ) {
    if (this._inputSchema) {
      // TODO: handle errors gracefully
      input = this.inputSchema.parse(input)
    }

    const messages: types.ChatMessage[] = this._messages
      .map((message) => {
        return {
          ...message,
          content: message.content
            ? // support functions which return a string
              isFunction(message.content)
              ? message.content(input!)
              : getCompiledTemplate(dedent(message.content))(input).trim()
            : ''
        } as types.ChatMessage
      })
      .filter((message) => message.content || message.function_call)

    if (this._examples?.length) {
      // TODO: smarter example selection
      for (const example of this._examples) {
        messages.push({
          role: 'system',
          content: `Example input: ${example.input}\n\nExample output: ${example.output}`
        })
      }
    }

    const outputMsg = this.outputMessage()
    if (outputMsg !== null) {
      messages.push({
        role: 'system',
        content: outputMsg
      })
    }

    if (ctx?.retryMessage) {
      messages.push({
        role: 'system',
        content: ctx.retryMessage
      })
    }

    // TODO: filter/compress messages based on token counts

    return messages
  }

  public outputMessage(): string | null {
    const outputSchema = this._outputSchema

    if (!outputSchema) {
      return null
    }

    const schema = zodToJsonSchema(outputSchema) as types.Jsonifiable
    const schemaStr = stringifyForModel(schema, [
      'default',
      'additionalProperties',
      '$schema'
    ])

    let label: string
    if (outputSchema instanceof z.ZodArray) {
      label = 'JSON array (minified)'
    } else if (outputSchema instanceof z.ZodObject) {
      label = 'JSON object (minified)'
    } else if (outputSchema instanceof z.ZodNumber) {
      label = 'number'
    } else if (outputSchema instanceof z.ZodString) {
      label = 'string'
    } else if (outputSchema instanceof z.ZodBoolean) {
      label = 'boolean'
    } else {
      label = 'JSON value'
    }

    return dedent`Do not output code. Output a single ${label} according to the following JSON Schema:
        \`\`\`json
        ${schemaStr}
        \`\`\``
  }

  protected override async _call(
    ctx: types.TaskCallContext<TInput, types.LLMTaskResponseMetadata>
  ): Promise<TOutput> {
    const messages = await this.buildMessages(ctx.input, ctx)

    // console.log('>>>')
    // console.log(messages)

    let functions = this._modelParams?.functions
    let isUsingTools = false

    if (this.supportsTools) {
      if (this._tools?.length) {
        if (functions?.length) {
          throw new Error(`Cannot specify both tools and functions`)
        }

        functions = getChatMessageFunctionDefinitionsFromTasks(this._tools)
        isUsingTools = true
      }
    }

    let output: any

    do {
      const debugInfo: any = {
        ...this._modelParams,
        messages
      }

      if (functions) {
        debugInfo.functions = functions.map((f: any) => f?.name).filter(Boolean)
      }

      this._logger.info(
        debugInfo,
        `>>> Task createChatCompletion "${this.nameForHuman}"`
      )

      // console.log('<<< completion', { messages, functions })
      const completion = await this._createChatCompletion(messages, functions)
      const message = completion.message
      // console.log('>>> completion', completion.message)

      this._logger.info(
        message,
        `<<< Task createChatCompletion "${this.nameForHuman}"`
      )
      ctx.metadata.completion = completion

      if (message.function_call && !message.content) {
        const functionCall = message.function_call

        if (!isUsingTools) {
          // TODO: not sure what we should do in this case...
          output = functionCall
          break
        }

        const functionName = extractFunctionIdentifierFromString(
          functionCall.name
        )

        if (!functionName) {
          throw new errors.OutputValidationError(
            `Unrecognized function call "${functionCall.name}"`
          )
        }

        const tool = this._tools!.find(
          (tool) => tool.nameForModel === functionName
        )

        if (!tool) {
          throw new errors.OutputValidationError(
            `Function not found "${functionName}"`
          )
        }

        if (functionName !== functionCall.name) {
          // fix function name hallucinations
          functionCall.name = functionName
        }

        const rawFunctionCallArguments = functionCall.arguments?.trim()
        let functionArguments: any

        if (rawFunctionCallArguments) {
          try {
            functionArguments = JSON.parse(jsonrepair(rawFunctionCallArguments))
          } catch (err: any) {
            if (err instanceof JSONRepairError) {
              throw new errors.OutputValidationError(err.message, {
                cause: err
              })
            } else if (err instanceof SyntaxError) {
              throw new errors.OutputValidationError(
                `Invalid JSON object: ${err.message}`,
                { cause: err }
              )
            } else {
              throw err
            }
          }
        }

        // console.log('>>> sub-task', {
        //   task: functionName,
        //   input: functionArguments
        // })
        this._logger.info(
          {
            task: functionName,
            input: functionArguments
          },
          `>>> Sub-Task "${tool.nameForHuman}"`
        )

        // TODO: handle sub-task errors gracefully
        const toolCallResponse = await tool.callWithMetadata(
          functionArguments,
          ctx
        )

        this._logger.info(
          {
            task: functionName,
            input: functionArguments,
            output: toolCallResponse.result
          },
          `<<< Sub-Task "${tool.nameForHuman}"`
        )
        // console.log('<<< sub-task', {
        //   task: functionName,
        //   input: functionArguments,
        //   output: toolCallResponse.result
        // })

        // TODO: handle result as string or JSON
        // TODO: better support for JSON spacing
        const taskCallContent = stringifyForModel(toolCallResponse.result)

        // TODO: remove `any` cast once openai-fetch is updated
        messages.push(completion.message as any)
        messages.push({
          role: 'function',
          name: functionName,
          content: taskCallContent
        })

        // TODO: Add a guard for the maximum number of function calls. We should use the
        // `function_call` parameter to disable function calls if we hit this point.
        continue
      }

      output = completion.message.content
    } while (output === undefined)

    // console.log('===')
    // console.log(output)
    // console.log('<<<')

    if (this._outputSchema) {
      return parseOutput(output as string, this._outputSchema)
    } else {
      return output
    }
  }

  public async getNumTokensForMessages(messages: types.ChatMessage[]) {
    return getNumTokensForChatMessages({
      messages,
      model: this._model,
      getNumTokens: this.getNumTokens.bind(this)
    })
  }
}
