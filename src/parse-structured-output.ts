import type { JsonObject, JsonValue } from 'type-fest'
import { jsonrepair, JSONRepairError } from 'jsonrepair'
import { z, type ZodType } from 'zod'
import { fromZodError } from 'zod-validation-error'

import { ParseError } from './errors'
import { type SafeParseResult } from './types'

/**
 * Parses a string which is expected to contain a structured JSON value.
 *
 * The JSON value is fuzzily parsed in order to support common issues like
 * missing commas, trailing commas, and unquoted keys.
 *
 * The JSON value is then parsed against a `zod` schema to enforce the shape of
 * the output.
 *
 * @returns parsed output
 */
export function parseStructuredOutput<T>(
  value: unknown,
  outputSchema: ZodType<T>
): T {
  if (!value || typeof value !== 'string') {
    throw new Error('Invalid output: expected string')
  }

  const output = value as string

  let result
  if (outputSchema instanceof z.ZodArray || 'element' in outputSchema) {
    result = parseArrayOutput(output)
  } else if (outputSchema instanceof z.ZodObject || 'omit' in outputSchema) {
    result = parseObjectOutput(output)
  } else if (outputSchema instanceof z.ZodBoolean) {
    result = parseBooleanOutput(output)
  } else if (
    outputSchema instanceof z.ZodNumber ||
    'nonnegative' in outputSchema
  ) {
    result = parseNumberOutput(output, outputSchema as unknown as z.ZodNumber)
  } else {
    // Default to string output...
    result = output
  }

  // TODO: fix typescript issue here with recursive types
  const safeResult = (outputSchema.safeParse as any)(result)

  if (!safeResult.success) {
    throw fromZodError(safeResult.error)
  }

  return safeResult.data
}

export function safeParseStructuredOutput<T>(
  value: unknown,
  outputSchema: ZodType<T>
): SafeParseResult<T> {
  if (!value || typeof value !== 'string') {
    return {
      success: false,
      error: 'Invalid output: expected string'
    }
  }

  const output = value as string

  try {
    const data = parseStructuredOutput<T>(output, outputSchema)
    return {
      success: true,
      data
    }
  } catch (err: any) {
    // console.error(err)

    return {
      success: false,
      error: err.message
    }
  }
}

/**
 * Checks if character at the specified index in a string is escaped.
 *
 * @param str - string to check
 * @param i - index of the character to check
 * @returns whether the character is escaped
 */
function isEscaped(str: string, i: number): boolean {
  return i > 0 && str[i - 1] === '\\' && !(i > 1 && str[i - 2] === '\\')
}

/**
 * Extracts JSON objects or arrays from a string.
 *
 * @param input - string to extract JSON from
 * @param jsonStructureType - type of JSON structure to extract
 * @returns array of extracted JSON objects or arrays
 */
export function extractJSONFromString(
  input: string,
  jsonStructureType: 'object' | 'array'
) {
  const startChar = jsonStructureType === 'object' ? '{' : '['
  const endChar = jsonStructureType === 'object' ? '}' : ']'
  const extractedJSONValues: JsonValue[] = []
  let nestingLevel = 0
  let startIndex = 0
  const isInsideQuoted = { '"': false, "'": false }

  for (let i = 0; i < input.length; i++) {
    const ch = input.charAt(i)
    switch (ch) {
      case '"':
      case "'":
        if (!isInsideQuoted[ch === '"' ? "'" : '"'] && !isEscaped(input, i)) {
          isInsideQuoted[ch] = !isInsideQuoted[ch]
        }

        break

      default:
        if (!isInsideQuoted['"'] && !isInsideQuoted["'"]) {
          switch (ch) {
            case startChar:
              if (nestingLevel === 0) {
                startIndex = i
              }

              nestingLevel += 1

              break

            case endChar:
              nestingLevel -= 1
              if (nestingLevel === 0) {
                const candidate = input.slice(startIndex, i + 1)
                const parsed = JSON.parse(jsonrepair(candidate))
                if (parsed && typeof parsed === 'object') {
                  extractedJSONValues.push(parsed as JsonValue)
                }
              } else if (nestingLevel < 0) {
                throw new ParseError(
                  `Invalid JSON string: unexpected ${endChar} at position ${i}`
                )
              }
          }
        }
    }
  }

  if (nestingLevel !== 0) {
    throw new ParseError(
      'Invalid JSON string: unmatched ' + startChar + ' or ' + endChar
    )
  }

  return extractedJSONValues
}

const BOOLEAN_OUTPUTS: Record<string, boolean> = {
  true: true,
  false: false,
  t: true,
  f: false,
  yes: true,
  no: false,
  y: true,
  n: false,
  '1': true,
  '0': false
}

/**
 * Parses an array output from a string.
 *
 * @param output - string to parse
 * @returns parsed array
 */
export function parseArrayOutput(output: string): JsonValue[] {
  try {
    const arrayOutput = extractJSONFromString(output, 'array')
    if (arrayOutput.length === 0) {
      throw new ParseError('Invalid JSON array')
    }

    const parsedOutput = arrayOutput[0]
    if (!Array.isArray(parsedOutput)) {
      throw new ParseError('Expected JSON array')
    }

    return parsedOutput
  } catch (err: any) {
    if (err instanceof JSONRepairError) {
      throw new ParseError(err.message, { cause: err })
    } else if (err instanceof SyntaxError) {
      throw new ParseError(`Invalid JSON array: ${err.message}`, { cause: err })
    } else {
      throw err
    }
  }
}

/**
 * Parses an object output from a string.
 *
 * @param output - string to parse
 * @returns parsed object
 */
export function parseObjectOutput(output: string): JsonObject {
  try {
    const arrayOutput = extractJSONFromString(output, 'object')
    if (arrayOutput.length === 0) {
      throw new ParseError('Invalid JSON object')
    }

    let parsedOutput = arrayOutput[0]
    if (Array.isArray(parsedOutput)) {
      // TODO
      parsedOutput = parsedOutput[0]
    }

    if (!parsedOutput || typeof parsedOutput !== 'object') {
      throw new ParseError('Expected JSON object')
    }

    return parsedOutput as JsonObject
  } catch (err: any) {
    if (err instanceof JSONRepairError) {
      throw new ParseError(err.message, { cause: err })
    } else if (err instanceof SyntaxError) {
      throw new ParseError(`Invalid JSON object: ${err.message}`, {
        cause: err
      })
    } else {
      throw err
    }
  }
}

/**
 * Parses a boolean output from a string.
 *
 * @param output - string to parse
 * @returns parsed boolean
 */
export function parseBooleanOutput(output: string): boolean {
  output = output
    .toLowerCase()
    .trim()
    .replace(/[!.?]+$/, '')

  const booleanOutput = BOOLEAN_OUTPUTS[output]

  if (booleanOutput === undefined) {
    throw new ParseError(`Invalid boolean output: ${output}`)
  } else {
    return booleanOutput
  }
}

/**
 * Parses a number output from a string.
 *
 * @param output - string to parse
 * @param outputSchema - zod number schema
 * @returns parsed number
 */
export function parseNumberOutput(
  output: string,
  outputSchema: z.ZodNumber
): number {
  output = output.trim()

  const numberOutput = outputSchema.isInt
    ? Number.parseInt(output)
    : Number.parseFloat(output)

  if (Number.isNaN(numberOutput)) {
    throw new ParseError(`Invalid number output: ${output}`)
  }

  return numberOutput
}
