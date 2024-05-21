import 'reflect-metadata'

import type { z } from 'zod'

import type * as types from './types.js'
import { FunctionSet } from './function-set.js'
import { ToolSet } from './tool-set.js'
import { zodToJsonSchema } from './zod-to-json-schema.js'

export const invocableMetadataKey = Symbol('invocable')

export interface Invocable {
  name: string
  description?: string
  inputSchema?: z.AnyZodObject
  callback: (args: Record<string, any>) => Promise<any>
}

export abstract class AIToolsProvider {
  private _tools?: ToolSet
  private _functions?: FunctionSet

  get namespace() {
    return this.constructor.name
  }

  get tools(): ToolSet {
    if (!this._tools) {
      this._tools = ToolSet.fromFunctionSet(this.functions)
    }

    return this._tools
  }

  get functions(): FunctionSet {
    if (!this._functions) {
      const invocables = getInvocables(this)
      const functions = invocables.map(getFunctionSpec)
      this._functions = new FunctionSet(functions)
    }

    return this._functions
  }
}

export function getFunctionSpec(invocable: Invocable): types.AIFunctionSpec {
  const { name, description, inputSchema } = invocable

  return {
    name,
    description,
    parameters: inputSchema
      ? zodToJsonSchema(inputSchema)
      : {
          type: 'object',
          properties: {}
        }
  }
}

/**
 * Constraints:
 *   - params must be an object, so the underlying function should only expect a
 *     single parameter
 *   - for the return value type `T | MaybePromise<T>`, `T` must be serializable
 *     to JSON
 */
export function aiFunction({
  name,
  description,
  inputSchema
}: {
  name?: string
  description?: string

  // params must be an object, so the underlying function should only expect a
  // single parameter
  inputSchema?: z.AnyZodObject
}) {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const existingInvocables = getPrivateInvocables(target)

    existingInvocables.push({
      propertyKey,
      description,
      name,
      inputSchema
    })

    setPrivateInvocables(target, existingInvocables)

    return descriptor.get ?? descriptor.value
  }
}

export function getInvocables(target: object): Invocable[] {
  const invocables = getPrivateInvocables(target)
  const namespace = target.constructor.name

  return invocables.map((invocable) => ({
    ...invocable,
    name: invocable.name ?? `${namespace}_${invocable.propertyKey}`,
    callback: (target as any)[invocable.propertyKey].bind(target)
  }))
}

interface PrivateInvocable {
  propertyKey: string
  name?: string
  description?: string
  inputSchema?: z.AnyZodObject
}

function getPrivateInvocables(target: object): PrivateInvocable[] {
  return Reflect.getMetadata(invocableMetadataKey, target) ?? []
}

function setPrivateInvocables(target: object, invocables: PrivateInvocable[]) {
  Reflect.defineMetadata(invocableMetadataKey, invocables, target)
}
