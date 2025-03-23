import type * as types from './types'
import { asSchema } from './schema'
import { assert } from './utils'

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
  spec: {
    /** Name of the function. */
    name: string
    /** Description of the function. */
    description?: string
    /** Zod schema for the function parameters. */
    inputSchema: InputSchema
    /**
     * Whether or not to enable structured output generation based on the given
     * zod schema.
     */
    strict?: boolean
  },
  /** Implementation of the function to call with the parsed arguments. */
  implementation: (
    params: types.inferInput<InputSchema>
  ) => types.MaybePromise<Output>
): types.AIFunction<InputSchema, Output> {
  assert(spec.name, 'createAIFunction missing required "spec.name"')
  assert(
    spec.inputSchema,
    'createAIFunction missing required "spec.inputSchema"'
  )
  assert(implementation, 'createAIFunction missing required "implementation"')
  assert(
    typeof implementation === 'function',
    'createAIFunction "implementation" must be a function'
  )

  const strict = !!spec.strict
  const inputSchema = asSchema(spec.inputSchema, { strict })

  /** Parse the arguments string, optionally reading from a message. */
  const parseInput = (
    input: string | types.Msg
  ): types.inferInput<InputSchema> => {
    if (typeof input === 'string') {
      return inputSchema.parse(input)
    } else {
      const args = input.function_call?.arguments
      assert(
        args,
        `Missing required function_call.arguments for function ${spec.name}`
      )
      return inputSchema.parse(args)
    }
  }

  // Call the implementation function with the parsed arguments.
  const aiFunction: types.AIFunction<InputSchema, Output> = (
    input: string | types.Msg
  ) => {
    const parsedInput = parseInput(input)

    return implementation(parsedInput)
  }

  // Override the default function name with the intended name.
  Object.defineProperty(aiFunction, 'name', {
    value: spec.name,
    writable: false
  })

  aiFunction.inputSchema = spec.inputSchema
  aiFunction.parseInput = parseInput

  aiFunction.spec = {
    name: spec.name,
    description: spec.description?.trim() ?? '',
    parameters: inputSchema.jsonSchema,
    type: 'function',
    strict
  }

  aiFunction.execute = (
    params: types.inferInput<InputSchema>
  ): types.MaybePromise<Output> => {
    return implementation(params)
  }

  return aiFunction
}
