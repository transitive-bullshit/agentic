import type * as types from './types'
import { asAgenticSchema } from './schema'
import { assert } from './utils'

export type CreateAIFunctionArgs<
  InputSchema extends types.AIFunctionInputSchema = types.AIFunctionInputSchema
> = {
  /** Name of the function. */
  name: string

  /** Description of the function. */
  description: string

  /**
   * Zod schema or AgenticSchema for the function parameters.
   *
   * You can use a JSON Schema for more dynamic tool sources such as MCP by
   * using the `createJsonSchema` utility function.
   */
  inputSchema: InputSchema

  /**
   * Whether to enable strict structured output generation based on the given
   * input schema. (this is a feature of the OpenAI API)
   *
   * Defaults to `true`.
   */
  strict?: boolean

  /**
   * Optional tags to help organize functions.
   */
  tags?: string[]
}

export type AIFunctionImplementation<
  InputSchema extends types.AIFunctionInputSchema,
  Output
> = (params: types.inferInput<InputSchema>) => types.MaybePromise<Output>

/**
 * Create a function meant to be used with OpenAI tool or function calling.
 *
 * The returned function will parse the arguments string and call the
 * implementation function with the parsed arguments.
 *
 * The `spec` property of the returned function is the spec for adding the
 * function to the OpenAI API `functions` property.
 */
export function createAIFunction<
  InputSchema extends types.AIFunctionInputSchema,
  Output
>(
  args: CreateAIFunctionArgs<InputSchema>,
  /** Underlying function implementation. */
  execute: AIFunctionImplementation<InputSchema, Output>
): types.AIFunction<InputSchema, Output>
export function createAIFunction<
  InputSchema extends types.AIFunctionInputSchema,
  Output
>(
  args: CreateAIFunctionArgs<InputSchema> & {
    /** Underlying function implementation. */
    execute: AIFunctionImplementation<InputSchema, Output>
  }
): types.AIFunction<InputSchema, Output>
export function createAIFunction<
  InputSchema extends types.AIFunctionInputSchema,
  Output
>(
  {
    name,
    description,
    inputSchema,
    strict = true,
    tags,
    execute
  }: CreateAIFunctionArgs<InputSchema> & {
    /** Underlying function implementation. */
    execute?: AIFunctionImplementation<InputSchema, Output>
  },
  /** Underlying function implementation. */
  executeArg?: AIFunctionImplementation<InputSchema, Output>
): types.AIFunction<InputSchema, Output> {
  assert(name, 'createAIFunction missing required "name"')
  assert(inputSchema, 'createAIFunction missing required "inputSchema"')
  assert(
    execute || executeArg,
    'createAIFunction missing required "execute" function implementation'
  )
  assert(
    !(execute && executeArg),
    'createAIFunction: cannot provide both "execute" and a second function argument. there should only be one function implementation.'
  )
  execute ??= executeArg
  assert(
    execute,
    'createAIFunction missing required "execute" function implementation'
  )
  assert(
    typeof execute === 'function',
    'createAIFunction "execute" must be a function'
  )

  const inputAgenticSchema = asAgenticSchema(inputSchema, { strict })

  /** Parse the arguments string, optionally reading from a message. */
  const parseInput = (
    input: string | types.Msg
  ): types.inferInput<InputSchema> => {
    if (typeof input === 'string') {
      return inputAgenticSchema.parse(input)
    } else {
      const args = input.function_call?.arguments
      assert(
        args,
        `Missing required function_call.arguments for function "${name}"`
      )
      return inputAgenticSchema.parse(args)
    }
  }

  // Call the underlying function implementation with the parsed arguments.
  const aiFunction: types.AIFunction<InputSchema, Output> = (
    input: string | types.Msg
  ) => {
    const parsedInput = parseInput(input)

    return execute(parsedInput)
  }

  // Override the default function name with the intended name.
  Object.defineProperty(aiFunction, 'name', {
    value: name,
    writable: false
  })

  aiFunction.inputSchema = inputSchema
  aiFunction.parseInput = parseInput
  aiFunction.execute = execute
  aiFunction.tags = tags
  aiFunction.spec = {
    name,
    description,
    parameters: inputAgenticSchema.jsonSchema,
    type: 'function',
    strict
  }

  return aiFunction
}
