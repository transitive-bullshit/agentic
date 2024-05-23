import './symbol-polyfill.js'

import type { z } from 'zod'

import type * as types from './types.js'
import { FunctionSet } from './function-set.js'
import { ToolSet } from './tool-set.js'
import { zodToJsonSchema } from './zod-to-json-schema.js'

export const invocableMetadataKey = Symbol('invocable')

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
      const metadata = this.constructor[Symbol.metadata]
      const invocables = (metadata?.invocables as Invocable[]) ?? []
      const namespace = this.namespace

      const functions = invocables.map((invocable) => ({
        ...invocable,
        name: invocable.name ?? `${namespace}_${invocable.propertyKey}`,
        callback: (this as any)[invocable.propertyKey].bind(target)
      }))

      const functions = invocables.map(getFunctionSpec)
      this._functions = new FunctionSet(functions)
    }

    return this._functions
  }
}

export interface Invocable {
  name: string
  description?: string
  inputSchema?: z.AnyZodObject
  callback: (args: Record<string, any>) => Promise<any>
}

function getFunctionSpec(invocable: Invocable): types.AIFunctionSpec {
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

export function aiFunction<
  This,
  Args extends any[],
  Return extends Promise<any>
>({
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
  return (
    targetMethod: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<
      This,
      (this: This, ...args: Args) => Return
    >
  ) => {
    const methodName = String(context.name)
    if (!context.metadata.invocables) {
      context.metadata.invocables = []
    }

    ;(context.metadata.invocables as Invocable[]).push({
      name: name ?? methodName,
      description,
      inputSchema,
      callback: targetMethod
    })

    return targetMethod

    // function replacementMethod(this: This, ...args: Args): Return {
    //   console.log(`LOG: Entering method '${methodName}'.`)
    //   const result = targetMethod.call(this, ...args)
    //   console.log(`LOG: Exiting method '${methodName}'.`)
    //   return result
    // }

    // return replacementMethod
  }
}
