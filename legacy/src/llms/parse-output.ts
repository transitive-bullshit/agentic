import { JSONRepairError, jsonrepair } from 'jsonrepair'
import { JsonValue } from 'type-fest'
import { ZodType, z } from 'zod'

import * as errors from '@/errors'

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
                  extractedJSONValues.push(parsed)
                }
              } else if (nestingLevel < 0) {
                throw new Error(
                  `Invalid JSON string: unexpected ${endChar} at position ${i}`
                )
              }
          }
        }
    }
  }

  if (nestingLevel !== 0) {
    throw new Error(
      'Invalid JSON string: unmatched ' + startChar + ' or ' + endChar
    )
  }

  return extractedJSONValues
}

const BOOLEAN_OUTPUTS = {
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
export function parseArrayOutput(output: string): Array<any> {
  try {
    const arr = extractJSONFromString(output, 'array')
    if (arr.length === 0) {
      throw new errors.OutputValidationError(`Invalid JSON array: ${output}`)
    }

    const parsedOutput = arr[0]
    if (!Array.isArray(parsedOutput)) {
      throw new errors.OutputValidationError(
        `Invalid JSON array: ${JSON.stringify(parsedOutput)}`
      )
    }

    return parsedOutput
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
}

/**
 * Parses an object output from a string.
 *
 * @param output - string to parse
 * @returns parsed object
 */
export function parseObjectOutput(output: string) {
  try {
    const arr = extractJSONFromString(output, 'object')
    if (arr.length === 0) {
      throw new errors.OutputValidationError(`Invalid JSON object: ${output}`)
    }

    let parsedOutput = arr[0]
    if (Array.isArray(parsedOutput)) {
      // TODO
      parsedOutput = parsedOutput[0]
    } else if (typeof parsedOutput !== 'object') {
      throw new errors.OutputValidationError(
        `Invalid JSON object: ${JSON.stringify(parsedOutput)}`
      )
    }

    return parsedOutput
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
    .replace(/[.!?]+$/, '')

  const booleanOutput = BOOLEAN_OUTPUTS[output]

  if (booleanOutput !== undefined) {
    return booleanOutput
  } else {
    throw new errors.OutputValidationError(`Invalid boolean output: ${output}`)
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
    ? parseInt(output)
    : parseFloat(output)

  if (isNaN(numberOutput)) {
    throw new errors.OutputValidationError(`Invalid number output: ${output}`)
  }

  return numberOutput
}

/**
 * Parses an output value from a string.
 *
 * @param output - string to parse
 * @param outputSchema - zod schema
 * @returns parsed output
 */
export function parseOutput(output: string, outputSchema: ZodType<any>) {
  let result
  if (outputSchema instanceof z.ZodArray) {
    result = parseArrayOutput(output)
  } else if (outputSchema instanceof z.ZodObject) {
    result = parseObjectOutput(output)
  } else if (outputSchema instanceof z.ZodBoolean) {
    result = parseBooleanOutput(output)
  } else if (outputSchema instanceof z.ZodNumber) {
    result = parseNumberOutput(output, outputSchema)
  } else {
    // Default to string output...
    result = output
  }

  // TODO: fix typescript issue here with recursive types
  const safeResult = (outputSchema.safeParse as any)(result)

  if (!safeResult.success) {
    throw new errors.ZodOutputValidationError(safeResult.error)
  }

  return safeResult.data
}
