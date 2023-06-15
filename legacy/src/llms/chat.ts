import { JSONRepairError, jsonrepair } from 'jsonrepair'
import { dedent } from 'ts-dedent'
import { type SetRequired } from 'type-fest'
import { ZodType, z } from 'zod'
import { printNode, zodToTs } from 'zod-to-ts'

import * as errors from '@/errors'
import * as types from '@/types'
import { BaseTask } from '@/task'
import { getCompiledTemplate } from '@/template'
import {
  extractJSONArrayFromString,
  extractJSONObjectFromString
} from '@/utils'

import { BaseLLM } from './llm'
import {
  getChatMessageFunctionDefinitionsFromTasks,
  getNumTokensForChatMessages
} from './llm-utils'

export abstract class BaseChatCompletion<
  TInput extends void | types.JsonObject = void,
  TOutput extends types.JsonValue = string,
  TModelParams extends Record<string, any> = Record<string, any>,
  TChatCompletionResponse extends Record<string, any> = Record<string, any>
> extends BaseLLM<TInput, TOutput, TModelParams> {
  protected _messages: types.ChatMessage[]
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
  input<U extends void | types.JsonObject>(
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
  output<U extends types.JsonValue>(
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

    const messages = this._messages
      .map((message) => {
        return {
          ...message,
          content: message.content
            ? getCompiledTemplate(dedent(message.content))(input).trim()
            : ''
        }
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

    if (this._outputSchema) {
      // TODO: replace zod-to-ts with zod-to-json-schema?
      const { node } = zodToTs(this._outputSchema)

      if (node.kind === 152) {
        // handle raw strings differently
        messages.push({
          role: 'system',
          content: dedent`Output a raw string only, without any additional text.`
        })
      } else {
        const tsTypeString = printNode(node, {
          removeComments: false,
          // TODO: this doesn't seem to actually work, so we're doing it manually below
          omitTrailingSemicolon: true,
          noEmitHelpers: true
        })
          .replace(/^ {4}/gm, '  ')
          .replace(/;$/gm, '')

        const label =
          this._outputSchema instanceof z.ZodArray
            ? 'JSON array'
            : this._outputSchema instanceof z.ZodObject
            ? 'JSON object'
            : this._outputSchema instanceof z.ZodNumber
            ? 'number'
            : this._outputSchema instanceof z.ZodString
            ? 'string'
            : this._outputSchema instanceof z.ZodBoolean
            ? 'boolean'
            : 'JSON value'

        messages.push({
          role: 'system',
          content: dedent`Do not output code. Output a single ${label} in the following TypeScript format:
          \`\`\`ts
          ${tsTypeString}
          \`\`\``
        })
      }
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
      // console.log('>>> completion', completion.message)

      this._logger.info(
        completion.message,
        `<<< Task createChatCompletion "${this.nameForHuman}"`
      )
      ctx.metadata.completion = completion

      if (completion.message.function_call) {
        const functionCall = completion.message.function_call

        if (!isUsingTools) {
          // TODO: not sure what we should do in this case...
          output = functionCall
          break
        }

        const tool = this._tools!.find(
          (tool) => tool.nameForModel === functionCall.name
        )

        if (!tool) {
          throw new errors.OutputValidationError(
            `Function not found "${functionCall.name}"`
          )
        }

        let functionArguments: any
        try {
          functionArguments = JSON.parse(jsonrepair(functionCall.arguments))
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

        // console.log('>>> sub-task', {
        //   task: functionCall.name,
        //   input: functionArguments
        // })
        this._logger.info(
          {
            task: functionCall.name,
            input: functionArguments
          },
          `>>> Sub-Task "${tool.nameForHuman}"`
        )

        // TODO: handle sub-task errors gracefully
        const toolCallResponse = await tool.callWithMetadata(functionArguments)

        this._logger.info(
          {
            task: functionCall.name,
            input: functionArguments,
            output: toolCallResponse.result
          },
          `<<< Sub-Task "${tool.nameForHuman}"`
        )
        // console.log('<<< sub-task', {
        //   task: functionCall.name,
        //   input: functionArguments,
        //   output: toolCallResponse.result
        // })

        // TODO: handle result as string or JSON
        // TODO: better support for JSON spacing
        const taskCallContent = JSON.stringify(
          toolCallResponse.result,
          null,
          1
        ).replaceAll(/\n ?/gm, ' ')

        // TODO: remove `any` cast once openai-fetch is updated
        messages.push(completion.message as any)
        messages.push({
          role: 'function',
          name: functionCall.name,
          content: taskCallContent
        })

        continue
      }

      output = completion.message.content
    } while (output === undefined)

    // console.log('===')
    // console.log(output)
    // console.log('<<<')

    if (this._outputSchema) {
      const outputSchema = this._outputSchema

      if (outputSchema instanceof z.ZodArray) {
        try {
          const trimmedOutput = extractJSONArrayFromString(output)
          output = JSON.parse(jsonrepair(trimmedOutput ?? output))
        } catch (err: any) {
          if (err instanceof JSONRepairError) {
            throw new errors.OutputValidationError(err.message, { cause: err })
          } else if (err instanceof SyntaxError) {
            throw new errors.OutputValidationError(
              `Invalid JSON array: ${err.message}`,
              { cause: err }
            )
          } else {
            throw err
          }
        }
      } else if (outputSchema instanceof z.ZodObject) {
        try {
          const trimmedOutput = extractJSONObjectFromString(output)
          output = JSON.parse(jsonrepair(trimmedOutput ?? output))

          if (Array.isArray(output)) {
            // TODO
            output = output[0]
          }
        } catch (err: any) {
          if (err instanceof JSONRepairError) {
            throw new errors.OutputValidationError(err.message, { cause: err })
          } else if (err instanceof SyntaxError) {
            throw new errors.OutputValidationError(
              `Invalid JSON object: ${err.message}`,
              { cause: err }
            )
          } else {
            throw err
          }
        }
      } else if (outputSchema instanceof z.ZodBoolean) {
        output = output.toLowerCase().trim()
        const booleanOutputs = {
          true: true,
          false: false,
          yes: true,
          no: false,
          1: true,
          0: false
        }

        const booleanOutput = booleanOutputs[output]

        if (booleanOutput !== undefined) {
          output = booleanOutput
        } else {
          throw new errors.OutputValidationError(
            `Invalid boolean output: ${output}`
          )
        }
      } else if (outputSchema instanceof z.ZodNumber) {
        output = output.trim()

        const numberOutput = outputSchema.isInt
          ? parseInt(output)
          : parseFloat(output)

        if (isNaN(numberOutput)) {
          throw new errors.OutputValidationError(
            `Invalid number output: ${output}`
          )
        } else {
          output = numberOutput
        }
      }

      // TODO: fix typescript issue here with recursive types
      const safeResult = (outputSchema.safeParse as any)(output)

      if (!safeResult.success) {
        throw new errors.ZodOutputValidationError(safeResult.error)
      }

      return safeResult.data
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
